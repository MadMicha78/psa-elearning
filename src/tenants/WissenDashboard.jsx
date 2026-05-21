// src/tenants/WissenDashboard.jsx
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';

const moduleIcons = {
  building: '🏢',
  industry: '🏭',
  'graduation-cap': '🎓',
  shield: '🛡️',
  docs: '📄',
  layers: '📑',
  bell: '🔔',
};

export function WissenDashboard({ user, onLogout }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modules, setModules] = useState([]);
  const [dokumente, setDokumente] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: mods, error: modErr } = await supabase
          .from('module')
          .select('*')
          .eq('organization_id', tenant.organizationId)
          .order('nr');
        if (modErr) throw modErr;

        const modIds = (mods || []).map((m) => m.id);
        let docs = [];
        if (modIds.length > 0) {
          const { data, error: docErr } = await supabase
            .from('dokumente')
            .select('*')
            .in('modul_id', modIds)
            .eq('typ', 'verfahrensanweisung')
            .order('nr');
          if (docErr) throw docErr;
          docs = data || [];
        }

        setModules(mods || []);
        setDokumente(docs);
      } catch (err) {
        console.error('Fehler beim Laden der Module:', err);
        setError('Module konnten nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tenant.organizationId]);

  const styles = {
    root: {
      minHeight: '100vh',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      background: t.bgSubtle,
      color: t.text,
    },
    header: {
      background: t.surface,
      borderBottom: `1px solid ${t.border}`,
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerLogo: { height: 36 },
    headerName: { fontSize: 14, color: t.textMuted, fontWeight: 500 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
    userInfo: { textAlign: 'right', fontSize: 13 },
    userName: { fontWeight: 600, color: t.text, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' },
    userMeta: { color: t.textMuted, fontSize: 12, marginTop: 2 },
    adminBadge: {
      display: 'inline-block', fontSize: 10, fontWeight: 700,
      color: t.primaryColor, background: `${t.primaryColor}15`,
      padding: '3px 8px', borderRadius: 4, marginLeft: 8,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    },
    logoutBtn: {
      padding: '8px 16px', fontSize: 13, fontWeight: 500,
      color: t.text, background: 'transparent',
      border: `1px solid ${t.border}`, borderRadius: 8,
      cursor: 'pointer', fontFamily: 'inherit',
      transition: 'background 0.15s, border-color 0.15s',
    },
    main: { maxWidth: 1200, margin: '0 auto', padding: '48px 32px' },
    hero: { marginBottom: 48 },
    heroTitle: {
      fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em',
      margin: 0, marginBottom: 8, color: t.text,
    },
    heroSubtext: { fontSize: 16, color: t.textMuted, margin: 0, lineHeight: 1.5 },

    moduleSection: { marginBottom: 48 },
    moduleHeader: {
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 18,
    },
    moduleIcon: { fontSize: 22 },
    moduleName: {
      fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.textMuted, margin: 0,
    },
    moduleCount: {
      fontSize: 12, color: t.textMuted, fontWeight: 500, marginLeft: 4,
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: 16,
    },
    card: {
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 20,
      cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
      display: 'flex', flexDirection: 'column', minHeight: 140,
    },
    cardTop: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 16,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
    },
    cardVaNr: {
      color: t.primaryColor, background: `${t.primaryColor}12`,
      padding: '4px 10px', borderRadius: 6,
    },
    cardRev: { color: t.textMuted },
    cardTitle: {
      fontSize: 18, fontWeight: 700, color: t.text,
      margin: 0, marginBottom: 8, letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    cardType: {
      fontSize: 12, color: t.textMuted, fontWeight: 500,
      marginTop: 'auto',
    },

    loadingBox: {
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '48px 32px', textAlign: 'center',
      color: t.textMuted, fontSize: 14,
    },
    errorBox: {
      background: '#FEE2E2', color: '#991B1B',
      border: '1px solid #FCA5A5', borderRadius: 8,
      padding: 16, fontSize: 14,
    },
    emptyBox: {
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '48px 32px', textAlign: 'center',
    },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 600, color: t.text, margin: 0, marginBottom: 8 },
    emptyText: { fontSize: 14, color: t.textMuted, margin: 0, lineHeight: 1.6 },
  };

  const firstName = user.name.split(' ')[0];
  const modulesMitDokumenten = modules.filter((mod) =>
    dokumente.some((doc) => doc.modul_id === mod.id)
  );

  const handleCardClick = (doc) => {
    alert(`📚 ${doc.titel}\n\n${doc.nr} · ${doc.version}\n\nDie Detail-Ansicht mit Inhalt + Quiz folgt in Stufe 2.`);
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
          <button
            onClick={onLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = t.bgSubtle;
              e.currentTarget.style.borderColor = t.borderStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = t.border;
            }}
          >
            Abmelden
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>Willkommen, {firstName}! 👋</h1>
          <p style={styles.heroSubtext}>
            Hier findest du deine zugewiesenen Schulungen und Verfahrensanweisungen.
          </p>
        </section>

        {loading && (
          <div style={styles.loadingBox}>Lade Module...</div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {!loading && !error && modulesMitDokumenten.length === 0 && (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>Keine Module verfügbar</h3>
            <p style={styles.emptyText}>
              Sobald dir Schulungen zugewiesen sind, erscheinen sie hier.
            </p>
          </div>
        )}

        {!loading && !error && modulesMitDokumenten.map((mod) => {
          const docs = dokumente.filter((d) => d.modul_id === mod.id);
          return (
            <section key={mod.id} style={styles.moduleSection}>
              <div style={styles.moduleHeader}>
                <span style={styles.moduleIcon}>{moduleIcons[mod.icon] || '📁'}</span>
                <h2 style={styles.moduleName}>{mod.name}</h2>
                <span style={styles.moduleCount}>{docs.length} {docs.length === 1 ? 'Modul' : 'Module'}</span>
              </div>
              <div style={styles.cardGrid}>
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    style={styles.card}
                    onClick={() => handleCardClick(doc)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = t.primaryColor;
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 27, 45, 0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.border;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={styles.cardTop}>
                      <span style={styles.cardVaNr}>{doc.nr}</span>
                      <span style={styles.cardRev}>{doc.version}</span>
                    </div>
                    <h3 style={styles.cardTitle}>{doc.titel}</h3>
                    <div style={styles.cardType}>Verfahrensanweisung</div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}