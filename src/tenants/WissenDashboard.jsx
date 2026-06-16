// src/tenants/WissenDashboard.jsx
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';

const gruppenIcons = {
  'Alle Mitarbeiter': '👥', 'Buero': '🏢', 'Büro': '🏢', 'Produktion': '🏭',
  'QM': '🛡️', 'Revision': '🔧', 'Montage': '🔩',
  'Steigschutzeinrichtung': '🪜', 'Textile Verarbeitung': '🧵', 'Werkstatt': '🛠️',
};

// Schöne Titel für die DOC-Untergruppen (nach Hauptnummer)
const docGruppenTitel = {
  '001': 'Seile nähen',
  '002': 'Bänder nähen',
  '003': 'Geräte pulvern',
  '004': 'Geräte montieren',
  '005': 'Steigschutzeinrichtung',
  '007': 'Bandfalldämpfer',
  '008': 'Auffanggurte',
  '009': 'Ausrüstung einschweißen',
  '180': 'Sets verpacken',
  '250': 'Montage',
  '0010': 'Alukisten auskleiden / verplomben',
  '0012': 'Zubehör',
  '0015': 'Montagearbeiten (intern)',
  '0017': 'Interne Konfektionierung',
};

// Aus "DOC 001 (10)" oder "DOC 0017a" die Hauptnummer "001" / "0017" ableiten
function docHauptnummer(nr) {
  if (!nr) return null;
  const m = nr.match(/DOC\s*0*(\d+)/i);
  if (!m) return null;
  // Führende Nullen für Sortierung normalisieren, aber Originalschlüssel behalten
  const raw = nr.match(/DOC\s*(\d+)/i);
  return raw ? raw[1] : m[1];
}

export function WissenDashboard({ user, onLogout, onOpenDoc }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gruppen, setGruppen] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [openDocs, setOpenDocs] = useState({}); // Welche DOC-Untergruppen sind aufgeklappt

  useEffect(() => {
    async function loadData() {
      try {
        let rollenData = [];
        if (user.is_admin) {
          const { data, error: e1 } = await supabase
            .from('rollen').select('id, name')
            .eq('organization_id', tenant.organizationId).order('name');
          if (e1) throw e1;
          rollenData = data || [];
        } else {
          const { data, error: e2 } = await supabase
            .from('mitarbeiter_rollen').select('rolle_id, rollen(id, name)')
            .eq('mitarbeiter_id', user.id);
          if (e2) throw e2;
          rollenData = (data || []).map((mr) => mr.rollen).filter(Boolean);
        }

        if (rollenData.length === 0) { setGruppen([]); return; }

        const rolleIds = rollenData.map((r) => r.id);
        const { data: pflicht, error: e3 } = await supabase
          .from('rolle_dokument_pflicht').select('rolle_id, dokumente(*)')
          .in('rolle_id', rolleIds);
        if (e3) throw e3;

        const grp = rollenData.map((rolle) => {
          const docs = (pflicht || [])
            .filter((p) => p.rolle_id === rolle.id)
            .map((p) => p.dokumente).filter(Boolean)
            .sort((a, b) => (a.nr || '').localeCompare(b.nr || '', 'de', { numeric: true }));
          return { ...rolle, dokumente: docs };
        }).filter((g) => g.dokumente.length > 0);
        setGruppen(grp);

        const alleDocIds = [...new Set(grp.flatMap((g) => g.dokumente.map((d) => d.id)))];
        if (alleDocIds.length > 0) {
          const { data: vorhandene, error: e4 } = await supabase
            .from('lern_zuweisungen')
            .select('dokument_id, status')
            .eq('mitarbeiter_id', user.id)
            .in('dokument_id', alleDocIds);
          if (e4) throw e4;

          const vorhandeneIds = new Set((vorhandene || []).map((z) => z.dokument_id));
          const fehlende = alleDocIds.filter((id) => !vorhandeneIds.has(id));

          if (fehlende.length > 0) {
            const neueZuweisungen = fehlende.map((docId) => ({
              organization_id: tenant.organizationId,
              mitarbeiter_id: user.id,
              dokument_id: docId,
              status: 'offen',
            }));
            const { error: e5 } = await supabase
              .from('lern_zuweisungen').insert(neueZuweisungen);
            if (e5) console.error('Konnte Zuweisungen nicht anlegen:', e5);
          }

          const map = {};
          (vorhandene || []).forEach((z) => { map[z.dokument_id] = z.status; });
          fehlende.forEach((id) => { map[id] = 'offen'; });
          setStatusMap(map);
        }
      } catch (err) {
        console.error('Fehler beim Laden:', err);
        setError('Schulungen konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.id, user.is_admin, tenant.organizationId]);

  const toggleDoc = (key) => setOpenDocs((prev) => ({ ...prev, [key]: !prev[key] }));

  const styles = {
    root: { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", background: t.bgSubtle, color: t.text },
    header: { background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerLogo: { height: 36 },
    headerName: { fontSize: 14, color: t.textMuted, fontWeight: 500 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { textAlign: 'right', fontSize: 13 },
    userName: { fontWeight: 600, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
    userMeta: { color: t.textMuted, fontSize: 12, marginTop: 2 },
    adminBadge: { display: 'inline-block', fontSize: 10, fontWeight: 700, color: t.primaryColor, background: `${t.primaryColor}15`, padding: '3px 8px', borderRadius: 4, marginLeft: 8, letterSpacing: '0.06em', textTransform: 'uppercase' },
    logoutBtn: { padding: '8px 16px', fontSize: 13, fontWeight: 500, color: t.text, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s' },
    main: { maxWidth: 1200, margin: '0 auto', padding: '48px 32px' },
    hero: { marginBottom: 40 },
    heroTitle: { fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, marginBottom: 8, color: t.text },
    heroSubtext: { fontSize: 16, color: t.textMuted, margin: 0, lineHeight: 1.5 },
    adminHint: { display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 500, color: t.primaryColor, background: `${t.primaryColor}0F`, padding: '6px 14px', borderRadius: 8 },
    groupSection: { marginBottom: 44 },
    groupHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 },
    groupIcon: { fontSize: 22 },
    groupName: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.textMuted, margin: 0 },
    groupCount: { fontSize: 12, color: t.textMuted, fontWeight: 500, marginLeft: 4 },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
    card: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s', display: 'flex', flexDirection: 'column', minHeight: 150, position: 'relative' },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' },
    cardVaNr: { color: t.primaryColor, background: `${t.primaryColor}12`, padding: '4px 10px', borderRadius: 6 },
    cardRev: { color: t.textMuted },
    cardTitle: { fontSize: 18, fontWeight: 700, color: t.text, margin: 0, marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.3 },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
    cardType: { fontSize: 12, color: t.textMuted, fontWeight: 500 },
    statusErledigt: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#0F766E', background: '#0F766E15', padding: '4px 10px', borderRadius: 20 },
    statusOffen: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#B45309', background: '#B4530915', padding: '4px 10px', borderRadius: 20 },
    // DOC-Untergruppe (Accordion)
    docHeader: { display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '16px 20px', marginBottom: 12, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s, background 0.15s' },
    docChevron: { fontSize: 14, color: t.textMuted, transition: 'transform 0.2s', width: 16, textAlign: 'center' },
    docHeaderNr: { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: t.primaryColor, background: `${t.primaryColor}12`, padding: '4px 10px', borderRadius: 6 },
    docHeaderTitle: { fontSize: 16, fontWeight: 700, color: t.text, flex: 1 },
    docHeaderMeta: { display: 'flex', alignItems: 'center', gap: 12 },
    docHeaderCount: { fontSize: 13, color: t.textMuted, fontWeight: 500 },
    docMiniProgress: { fontSize: 12, fontWeight: 700, color: '#0F766E', background: '#0F766E12', padding: '3px 10px', borderRadius: 20 },
    docBody: { marginBottom: 24, paddingLeft: 4 },
    loadingBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 },
    errorBox: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: 16, fontSize: 14 },
    emptyBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center' },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 600, color: t.text, margin: 0, marginBottom: 8 },
    emptyText: { fontSize: 14, color: t.textMuted, margin: 0, lineHeight: 1.6 },
  };

  const firstName = user.name.split(' ')[0];
  const typLabel = (typ) => {
    if (typ === 'verfahrensanweisung') return 'Verfahrensanweisung';
    if (typ === 'arbeitsanweisung') return 'Arbeitsanweisung';
    if (typ === 'unterweisung') return 'Unterweisung';
    if (typ === 'schulung') return 'Schulung';
    return 'Dokument';
  };

  const offenCount = Object.values(statusMap).filter((s) => s !== 'abgeschlossen').length;

  // Eine einzelne Kachel rendern
  const renderCard = (doc) => {
    const erledigt = statusMap[doc.id] === 'abgeschlossen';
    return (
      <div key={doc.id} style={styles.card}
        onClick={() => onOpenDoc && onOpenDoc(doc)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primaryColor; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 27, 45, 0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        <div style={styles.cardTop}>
          <span style={styles.cardVaNr}>{doc.nr}</span>
          <span style={styles.cardRev}>{doc.version}</span>
        </div>
        <h3 style={styles.cardTitle}>{doc.titel}</h3>
        <div style={styles.cardFooter}>
          <span style={styles.cardType}>{typLabel(doc.typ)}</span>
          {!user.is_admin && (
            erledigt
              ? <span style={styles.statusErledigt}>✓ Erledigt</span>
              : <span style={styles.statusOffen}>● Offen</span>
          )}
        </div>
      </div>
    );
  };

  // Dokumente einer Arbeitsgruppe rendern: VAs als Kacheln, AAs gruppiert nach DOC-Nummer
  const renderGruppenInhalt = (grp) => {
    const vas = grp.dokumente.filter((d) => d.typ !== 'arbeitsanweisung');
    const aas = grp.dokumente.filter((d) => d.typ === 'arbeitsanweisung');

    // AAs nach DOC-Hauptnummer bündeln
    const docMap = {};
    aas.forEach((d) => {
      const key = docHauptnummer(d.nr) || 'sonstige';
      if (!docMap[key]) docMap[key] = [];
      docMap[key].push(d);
    });
    const docKeys = Object.keys(docMap).sort((a, b) => a.localeCompare(b, 'de', { numeric: true }));

    return (
      <>
        {/* VAs als normale Kacheln */}
        {vas.length > 0 && <div style={styles.cardGrid}>{vas.map(renderCard)}</div>}

        {/* AAs als aufklappbare DOC-Untergruppen */}
        {docKeys.map((key) => {
          const docs = docMap[key];
          const accKey = `${grp.id}-${key}`;
          const isOpen = !!openDocs[accKey];
          const erledigtCount = docs.filter((d) => statusMap[d.id] === 'abgeschlossen').length;
          const titel = docGruppenTitel[key] || 'Arbeitsanweisungen';
          return (
            <div key={accKey}>
              <button style={styles.docHeader}
                onClick={() => toggleDoc(accKey)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.primaryColor; e.currentTarget.style.background = t.bgSubtle; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.surface; }}>
                <span style={{ ...styles.docChevron, transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                <span style={styles.docHeaderNr}>DOC {key}</span>
                <span style={styles.docHeaderTitle}>{titel}</span>
                <span style={styles.docHeaderMeta}>
                  {!user.is_admin && erledigtCount > 0 && (
                    <span style={styles.docMiniProgress}>{erledigtCount}/{docs.length} ✓</span>
                  )}
                  <span style={styles.docHeaderCount}>{docs.length} {docs.length === 1 ? 'Schulung' : 'Schulungen'}</span>
                </span>
              </button>
              {isOpen && <div style={styles.docBody}><div style={styles.cardGrid}>{docs.map(renderCard)}</div></div>}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={b.logo} alt={b.logoAlt} style={styles.headerLogo} />
          <span style={styles.headerName}>{tenant.name}</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>
              {user.name}
              {user.is_admin && <span style={styles.adminBadge}>Admin</span>}
            </div>
            <div style={styles.userMeta}>{user.personal} · {user.abt}</div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}
            onMouseEnter={(e) => { e.currentTarget.style.background = t.bgSubtle; e.currentTarget.style.borderColor = t.borderStrong; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = t.border; }}>
            Abmelden
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Willkommen, {firstName}! 👋</h1>
          <p style={styles.heroSubtext}>
            {user.is_admin
              ? 'Hier siehst du alle Arbeitsgruppen und ihre zugewiesenen Schulungen.'
              : offenCount > 0
                ? `Du hast noch ${offenCount} ${offenCount === 1 ? 'offene Schulung' : 'offene Schulungen'} zu bearbeiten.`
                : 'Alle deine Schulungen sind erledigt. Sehr gut! 🎉'}
          </p>
          {user.is_admin && <span style={styles.adminHint}>Admin-Ansicht · alle Arbeitsgruppen</span>}
        </section>

        {loading && <div style={styles.loadingBox}>Lade Schulungen…</div>}
        {error && !loading && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && gruppen.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>Noch keine Schulungen zugewiesen</h3>
            <p style={styles.emptyText}>Sobald deine Arbeitsgruppe Schulungen erhält, erscheinen sie hier.</p>
          </div>
        )}

        {!loading && !error && gruppen.map((grp) => (
          <section key={grp.id} style={styles.groupSection}>
            <div style={styles.groupHeader}>
              <span style={styles.groupIcon}>{gruppenIcons[grp.name] || '📁'}</span>
              <h2 style={styles.groupName}>{grp.name}</h2>
              <span style={styles.groupCount}>{grp.dokumente.length} {grp.dokumente.length === 1 ? 'Schulung' : 'Schulungen'}</span>
            </div>
            {renderGruppenInhalt(grp)}
          </section>
        ))}
      </main>
    </div>
  );
}