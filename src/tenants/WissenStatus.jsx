// src/tenants/WissenStatus.jsx
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';

export function WissenStatus({ user, onBack, onLogout }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);        // [{ ma, docs:[{doc, erledigt, datum, score, total}], erledigtCount, total }]
  const [openMa, setOpenMa] = useState({});

  useEffect(() => {
    async function load() {
      try {
        // 1. Alle Mitarbeiter des Tenants
        const { data: mitarbeiter, error: e1 } = await supabase
          .from('mitarbeiter').select('id, name, personal, abt')
          .eq('organization_id', tenant.organizationId)
          .order('name');
        if (e1) throw e1;

        // 2. MA -> Rollen
        const { data: maRollen, error: e2 } = await supabase
          .from('mitarbeiter_rollen').select('mitarbeiter_id, rolle_id');
        if (e2) throw e2;

        // 3. Rolle -> Pflichtdokumente
        const { data: pflicht, error: e3 } = await supabase
          .from('rolle_dokument_pflicht').select('rolle_id, dokument_id, dokumente(id, nr, titel, typ)');
        if (e3) throw e3;

        // 4. Nachweise des Tenants
        const { data: nachweise, error: e4 } = await supabase
          .from('nachweise').select('ma_id, dok_id, score, total, datum, created_at')
          .eq('organization_id', tenant.organizationId);
        if (e4) throw e4;

        // Hilfsstrukturen
        const pflichtProRolle = {};
        (pflicht || []).forEach((p) => {
          if (!p.dokumente) return;
          if (!pflichtProRolle[p.rolle_id]) pflichtProRolle[p.rolle_id] = [];
          pflichtProRolle[p.rolle_id].push(p.dokumente);
        });

        const rollenProMa = {};
        (maRollen || []).forEach((mr) => {
          if (!rollenProMa[mr.mitarbeiter_id]) rollenProMa[mr.mitarbeiter_id] = [];
          rollenProMa[mr.mitarbeiter_id].push(mr.rolle_id);
        });

        // bestes (höchstes) Nachweis-Ergebnis pro MA+Dok
        const nwProMaDok = {};
        (nachweise || []).forEach((n) => {
          const key = `${n.ma_id}|${n.dok_id}`;
          const quote = n.total ? n.score / n.total : 0;
          if (!nwProMaDok[key] || quote >= (nwProMaDok[key].score / (nwProMaDok[key].total || 1))) {
            nwProMaDok[key] = n;
          }
        });

        const result = (mitarbeiter || []).map((ma) => {
          const rollen = rollenProMa[ma.id] || [];
          // Pflichtdokumente dieses MA (dedupliziert)
          const docMap = {};
          rollen.forEach((rid) => {
            (pflichtProRolle[rid] || []).forEach((d) => { docMap[d.id] = d; });
          });
          const docs = Object.values(docMap).sort((a, b) => (a.nr || '').localeCompare(b.nr || '', 'de', { numeric: true }));

          const docRows = docs.map((d) => {
            const nw = nwProMaDok[`${ma.id}|${d.id}`];
            return {
              doc: d,
              erledigt: !!nw,
              datum: nw ? nw.datum : null,
              score: nw ? nw.score : null,
              total: nw ? nw.total : null,
            };
          });
          const erledigtCount = docRows.filter((r) => r.erledigt).length;
          return { ma, docs: docRows, erledigtCount, total: docRows.length };
        });

        setRows(result);
      } catch (err) {
        console.error('Status-Lade-Fehler:', err);
        setError('Schulungsstand konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tenant.organizationId]);

  const toggleMa = (id) => setOpenMa((p) => ({ ...p, [id]: !p[id] }));

  const ampel = (count, total) => {
    if (total === 0) return { farbe: '#94A3B8', label: 'keine Schulungen' };
    if (count === 0) return { farbe: '#DC2626', label: 'offen' };
    if (count < total) return { farbe: '#B45309', label: 'teilweise' };
    return { farbe: '#0F766E', label: 'vollständig' };
  };

  const exportCSV = () => {
    const lines = [['Mitarbeiter', 'Personalnummer', 'Abteilung', 'Schulung', 'Nummer', 'Status', 'Datum', 'Ergebnis'].join(';')];
    rows.forEach(({ ma, docs }) => {
      docs.forEach((r) => {
        lines.push([
          ma.name, ma.personal, ma.abt || '',
          (r.doc.titel || '').replace(/;/g, ','), r.doc.nr || '',
          r.erledigt ? 'erledigt' : 'offen',
          r.datum || '',
          r.erledigt && r.total ? `${r.score}/${r.total}` : '',
        ].join(';'));
      });
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Schulungsstand_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Kennzahlen
  const maGesamt = rows.length;
  const pflichtGesamt = rows.reduce((s, r) => s + r.total, 0);
  const erledigtGesamt = rows.reduce((s, r) => s + r.erledigtCount, 0);
  const gesamtQuote = pflichtGesamt ? Math.round((erledigtGesamt / pflichtGesamt) * 100) : 0;

  const styles = {
    root: { minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: t.bgSubtle, color: t.text },
    header: { background: t.surface, borderBottom: `1px solid ${t.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerLogo: { height: 36 },
    headerName: { fontSize: 14, color: t.textMuted, fontWeight: 500 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { textAlign: 'right', fontSize: 13 },
    userName: { fontWeight: 600, color: t.text },
    userMeta: { color: t.textMuted, fontSize: 12, marginTop: 2 },
    logoutBtn: { padding: '8px 16px', fontSize: 13, fontWeight: 500, color: t.text, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
    main: { maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' },
    topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' },
    backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: t.primaryColor, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
    csvBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, color: '#FFF', background: t.primaryColor, border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' },
    title: { fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 24px', color: t.text },
    kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 },
    kpiCard: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 },
    kpiLabel: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 8 },
    kpiValue: { fontSize: 32, fontWeight: 700, color: t.text },
    kpiSub: { fontSize: 13, color: t.textMuted, marginTop: 4 },
    maCard: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    maHeader: { display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', fontFamily: 'inherit' },
    chevron: { fontSize: 12, color: t.textMuted, width: 14, transition: 'transform 0.2s' },
    ampelDot: (farbe) => ({ width: 12, height: 12, borderRadius: '50%', background: farbe, flexShrink: 0 }),
    maName: { fontSize: 16, fontWeight: 700, color: t.text, flex: 1 },
    maMeta: { fontSize: 13, color: t.textMuted },
    quoteBadge: (farbe) => ({ fontSize: 13, fontWeight: 700, color: farbe, background: `${farbe}15`, padding: '4px 12px', borderRadius: 20, minWidth: 90, textAlign: 'center' }),
    detailWrap: { borderTop: `1px solid ${t.border}`, padding: '8px 20px 16px' },
    detailRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${t.bgSubtle}`, fontSize: 14 },
    detailNr: { fontSize: 11, fontWeight: 700, color: t.primaryColor, background: `${t.primaryColor}10`, padding: '3px 8px', borderRadius: 5, minWidth: 90 },
    detailTitel: { flex: 1, color: t.text },
    detailStatusOk: { fontSize: 12, fontWeight: 700, color: '#0F766E', background: '#0F766E12', padding: '3px 10px', borderRadius: 20 },
    detailStatusOffen: { fontSize: 12, fontWeight: 600, color: '#B45309', background: '#B4530912', padding: '3px 10px', borderRadius: 20 },
    detailDatum: { fontSize: 12, color: t.textMuted, minWidth: 130, textAlign: 'right' },
    loadingBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 },
    errorBox: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: 16, fontSize: 14 },
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
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userMeta}>{user.personal} · {user.abt}</div>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>Abmelden</button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.topRow}>
          <button onClick={onBack} style={styles.backBtn}>← Zurück zur Übersicht</button>
          {!loading && !error && rows.length > 0 && (
            <button onClick={exportCSV} style={styles.csvBtn}>⬇ CSV exportieren</button>
          )}
        </div>

        <h1 style={styles.title}>Schulungsstand</h1>

        {loading && <div style={styles.loadingBox}>Lade Schulungsstand…</div>}
        {error && !loading && <div style={styles.errorBox}>{error}</div>}

        {!loading && !error && (
          <>
            <div style={styles.kpiRow}>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Mitarbeiter</div>
                <div style={styles.kpiValue}>{maGesamt}</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Schulungen gesamt</div>
                <div style={styles.kpiValue}>{pflichtGesamt}</div>
                <div style={styles.kpiSub}>{erledigtGesamt} erledigt</div>
              </div>
              <div style={styles.kpiCard}>
                <div style={styles.kpiLabel}>Gesamt-Quote</div>
                <div style={styles.kpiValue}>{gesamtQuote}%</div>
              </div>
            </div>

            {rows.map(({ ma, docs, erledigtCount, total }) => {
              const a = ampel(erledigtCount, total);
              const isOpen = !!openMa[ma.id];
              return (
                <div key={ma.id} style={styles.maCard}>
                  <button style={styles.maHeader} onClick={() => toggleMa(ma.id)}>
                    <span style={{ ...styles.chevron, transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                    <span style={styles.ampelDot(a.farbe)} />
                    <span style={styles.maName}>{ma.name}</span>
                    <span style={styles.maMeta}>{ma.personal}{ma.abt ? ` · ${ma.abt}` : ''}</span>
                    <span style={styles.quoteBadge(a.farbe)}>
                      {erledigtCount}/{total}{total > 0 ? ` · ${Math.round((erledigtCount / total) * 100)}%` : ''}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={styles.detailWrap}>
                      {docs.length === 0 && (
                        <div style={{ padding: '12px 0', color: t.textMuted, fontSize: 14 }}>
                          Diesem Mitarbeiter sind noch keine Schulungen zugewiesen (keine Arbeitsgruppe).
                        </div>
                      )}
                      {docs.map((r) => (
                        <div key={r.doc.id} style={styles.detailRow}>
                          <span style={styles.detailNr}>{r.doc.nr}</span>
                          <span style={styles.detailTitel}>{r.doc.titel}</span>
                          {r.erledigt
                            ? <span style={styles.detailStatusOk}>✓ {r.total ? `${r.score}/${r.total}` : 'erledigt'}</span>
                            : <span style={styles.detailStatusOffen}>● offen</span>}
                          <span style={styles.detailDatum}>{r.datum || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}
