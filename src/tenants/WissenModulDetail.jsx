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
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data: rev, error: e1 } = await supabase
          .from('dokument_revisionen').select('*')
          .eq('dokument_id', doc.id)
          .eq('organization_id', tenant.organizationId)
          .order('revision_nummer', { ascending: false })
          .limit(1).single();
        if (e1) throw e1;
        setRevision(rev);

        const { data: zuw } = await supabase
          .from('lern_zuweisungen').select('status')
          .eq('mitarbeiter_id', user.id)
          .eq('dokument_id', doc.id)
          .limit(1).single();
        setStatus(zuw ? zuw.status : 'offen');
      } catch (err) {
        console.error('Lade-Fehler:', err);
        setError('Inhalt konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doc.id, tenant.organizationId, user.id]);

  const handleBestaetigen = async () => {
    setSaving(true);
    try {
      const jetzt = new Date();
      const nachweisId = `${user.personal}-${doc.nr}-${jetzt.getTime()}`.replace(/\s+/g, '');

      const { error: e1 } = await supabase.from('nachweise').insert({
        ma_id: user.id,
        dok_id: doc.id,
        revision_id: revision ? revision.id : null,
        score: 1,
        total: 1,
        nachweis_id: nachweisId,
        datum: jetzt.toLocaleDateString('de-DE'),
        organization_id: tenant.organizationId,
      });
      if (e1) throw e1;

      const { error: e2 } = await supabase
        .from('lern_zuweisungen')
        .update({ status: 'abgeschlossen', zuletzt_geaendert: jetzt.toISOString() })
        .eq('mitarbeiter_id', user.id)
        .eq('dokument_id', doc.id);
      if (e2) throw e2;

      setStatus('abgeschlossen');
    } catch (err) {
      console.error('Bestätigung fehlgeschlagen:', err);
      setError('Bestätigung konnte nicht gespeichert werden. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

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
    docMeta: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
    docNr: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: t.primaryColor, background: `${t.primaryColor}12`, padding: '4px 10px', borderRadius: 6 },
    docRev: { fontSize: 12, color: t.textMuted, fontWeight: 600 },
    docType: { fontSize: 12, color: t.textMuted },
    statusErledigt: { fontSize: 11, fontWeight: 700, color: '#0F766E', background: '#0F766E15', padding: '4px 10px', borderRadius: 20 },
    docTitle: { fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: t.text },
    contentBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '40px 48px', lineHeight: 1.7, fontSize: 15 },
    loadingBox: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: '48px 32px', textAlign: 'center', color: t.textMuted, fontSize: 14 },
    errorBox: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 8, padding: 16, fontSize: 14, marginTop: 16 },
    confirmBox: { marginTop: 32, padding: 28, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, textAlign: 'center' },
    confirmTitle: { fontSize: 18, fontWeight: 700, color: t.text, margin: 0, marginBottom: 8 },
    confirmText: { fontSize: 14, color: t.textMuted, margin: 0, marginBottom: 20, lineHeight: 1.6 },
    confirmBtn: { padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', color: '#FFFFFF', background: t.primaryColor, border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'opacity 0.15s' },
    doneBox: { marginTop: 32, padding: 28, background: '#0F766E0A', border: '1px solid #0F766E40', borderRadius: 12, textAlign: 'center' },
    doneIcon: { fontSize: 40, marginBottom: 8 },
    doneTitle: { fontSize: 18, fontWeight: 700, color: '#0F766E', margin: 0, marginBottom: 4 },
    doneText: { fontSize: 13, color: t.textMuted, margin: 0 },
  };

  const mdComponents = {
    table: (p) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 }} {...p} />,
    th: (p) => <th style={{ background: t.bgSubtle, padding: '10px 12px', textAlign: 'left', borderBottom: `2px solid ${t.borderStrong}`, fontWeight: 700 }} {...p} />,
    td: (p) => <td style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border}`, verticalAlign: 'top' }} {...p} />,
    p: (p) => <p style={{ margin: '12px 0' }} {...p} />,
    h1: (p) => <h1 style={{ fontSize: 24, fontWeight: 700, margin: '24px 0 12px' }} {...p} />,
    h2: (p) => <h2 style={{ fontSize: 20, fontWeight: 700, margin: '20px 0 10px' }} {...p} />,
    strong: (p) => <strong style={{ color: t.text, fontWeight: 700 }} {...p} />,
  };

  const erledigt = status === 'abgeschlossen';

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
        <button onClick={onBack} style={styles.backBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = t.bgSubtle}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          ← Zurück zur Übersicht
        </button>

        <section style={styles.docHero}>
          <div style={styles.docMeta}>
            <span style={styles.docNr}>{doc.nr}</span>
            <span style={styles.docRev}>{doc.version}</span>
            <span style={styles.docType}>· Verfahrensanweisung</span>
            {erledigt && <span style={styles.statusErledigt}>✓ Erledigt</span>}
          </div>
          <h1 style={styles.docTitle}>{doc.titel}</h1>
        </section>

        {loading && <div style={styles.loadingBox}>Lade Inhalt…</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        {revision && !loading && (
          <>
            <div style={styles.contentBox}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {revision.inhalt || '_Kein Inhalt verfügbar._'}
              </ReactMarkdown>
            </div>

            {erledigt ? (
              <div style={styles.doneBox}>
                <div style={styles.doneIcon}>✓</div>
                <h3 style={styles.doneTitle}>Bereits bestätigt</h3>
                <p style={styles.doneText}>Du hast diese Schulung als gelesen und verstanden bestätigt.</p>
              </div>
            ) : (
              <div style={styles.confirmBox}>
                <h3 style={styles.confirmTitle}>Schulung abschließen</h3>
                <p style={styles.confirmText}>
                  Mit dem Klick bestätigst du, dass du diese Verfahrensanweisung vollständig gelesen und verstanden hast.
                </p>
                <button
                  style={{ ...styles.confirmBtn, opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
                  onClick={handleBestaetigen}
                  disabled={saving}
                >
                  {saving ? 'Wird gespeichert…' : '✓ Gelesen & verstanden'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}