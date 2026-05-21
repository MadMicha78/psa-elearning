// src/tenants/WissenModulDetail.jsx
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function WissenModulDetail({ doc, user, onBack, onLogout }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error: supaErr } = await supabase
          .from('dokument_revisionen')
          .select('*')
          .eq('dokument_id', doc.id)
          .eq('organization_id', tenant.organizationId)
          .order('revision_nummer', { ascending: false })
          .limit(1)
          .single();
        if (supaErr) throw supaErr;
        setRevision(data);
      } catch (err) {
        console.error('Lade-Fehler:', err);
        setError('Inhalt konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doc.id, tenant.organizationId]);

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
    main: { maxWidth: 960, margin: '0 auto', padding: '32px 32px 64px' },
    backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: t.primaryColor, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32, transition: 'background 0.15s' },
    docHero: { marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${t.border}` },
    docMeta: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
    docNr: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: t.primaryColor, background: `${t.primaryColor}12`, padding: '4px 10px', borderRadius: 6 },
    docRev: { fontSize: 12, color: t.textMuted, fontWeight: 600 },
    docType: { fontSize: 12, color: t.textMuted },
    docTitle: { fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: t.text },
    contentBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '40px 48px', lineHeight: 1.7, fontSize: 15 },
    loadingBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 },
    errorBox: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: 16, fontSize: 14 },
    futureBox: { marginTop: 32, padding: 20, background: `${t.primaryColor}08`, border: `1px dashed ${t.primaryColor}40`, borderRadius: 10, fontSize: 13, color: t.textMuted, textAlign: 'center' },
  };

  const mdComponents = {
    table: ({node, ...props}) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 }} {...props} />,
    th: ({node, ...props}) => <th style={{ background: t.bgSubtle, padding: '10px 12px', textAlign: 'left', borderBottom: `2px solid ${t.borderStrong}`, fontWeight: 700 }} {...props} />,
    td: ({node, ...props}) => <td style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'top' }} {...props} />,
    p: ({node, ...props}) => <p style={{ margin: '12px 0' }} {...props} />,
    h1: ({node, ...props}) => <h1 style={{ fontSize: 24, fontWeight: 700, margin: '24px 0 12px' }} {...props} />,
    h2: ({node, ...props}) => <h2 style={{ fontSize: 20, fontWeight: 700, margin: '20px 0 10px' }} {...props} />,
    strong: ({node, ...props}) => <strong style={{ color: t.text, fontWeight: 700 }} {...props} />,
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
        <button
          onClick={onBack}
          style={styles.backBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = t.bgSubtle}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ← Zurück zur Übersicht
        </button>

        <section style={styles.docHero}>
          <div style={styles.docMeta}>
            <span style={styles.docNr}>{doc.nr}</span>
            <span style={styles.docRev}>{doc.version}</span>
            <span style={styles.docType}>· Verfahrensanweisung</span>
          </div>
          <h1 style={styles.docTitle}>{doc.titel}</h1>
        </section>

        {loading && <div style={styles.loadingBox}>Lade Inhalt…</div>}
        {error && !loading && <div style={styles.errorBox}>{error}</div>}
        {revision && !loading && (
          <>
            <div style={styles.contentBox}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {revision.inhalt || '_Kein Inhalt verfügbar._'}
              </ReactMarkdown>
            </div>
            <div style={styles.futureBox}>
              💡 In Stufe 3 kommt hier ein „Gelesen & verstanden"-Button und das Quiz dazu.
            </div>
          </>
        )}
      </main>
    </div>
  );
}