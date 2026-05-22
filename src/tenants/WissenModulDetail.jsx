// src/tenants/WissenModulDetail.jsx
import { useState, useEffect } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BESTEHENS_QUOTE = 0.8; // 80 %

// Fisher-Yates Shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function WissenModulDetail({ doc, user, onBack, onLogout }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(null);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  // Quiz-State
  const [fragen, setFragen] = useState([]);          // [{id, frage, optionen:[...], richtig}]
  const [phase, setPhase] = useState('lesen');        // 'lesen' | 'quiz' | 'ergebnis'
  const [frageIdx, setFrageIdx] = useState(0);
  const [auswahl, setAuswahl] = useState({});         // { frageId: gewählteOption }
  const [ergebnis, setErgebnis] = useState(null);     // { richtig, gesamt, bestanden }

  useEffect(() => {
    async function load() {
      try {
        // 1. Volltext-Revision
        const { data: rev, error: e1 } = await supabase
          .from('dokument_revisionen').select('*')
          .eq('dokument_id', doc.id)
          .eq('organization_id', tenant.organizationId)
          .order('revision_nummer', { ascending: false })
          .limit(1).single();
        if (e1) throw e1;
        setRevision(rev);

        // 2. Status der Zuweisung
        const { data: zuw } = await supabase
          .from('lern_zuweisungen').select('status')
          .eq('mitarbeiter_id', user.id)
          .eq('dokument_id', doc.id)
          .limit(1).single();
        setStatus(zuw ? zuw.status : 'offen');

        // 3. Quiz-Fragen für diese Revision laden (nur aktive)
        if (rev) {
          const { data: qf, error: e3 } = await supabase
            .from('quiz_fragen')
            .select('id, frage, antwort_richtig, antwort_falsch_1, antwort_falsch_2, antwort_falsch_3, reihenfolge')
            .eq('revision_id', rev.id)
            .eq('aktiv', true)
            .order('reihenfolge', { ascending: true });
          if (e3) throw e3;

          const aufbereitet = (qf || []).map((f) => ({
            id: f.id,
            frage: f.frage,
            richtig: f.antwort_richtig,
            optionen: shuffle([f.antwort_richtig, f.antwort_falsch_1, f.antwort_falsch_2, f.antwort_falsch_3]),
          }));
          setFragen(aufbereitet);
        }
      } catch (err) {
        console.error('Lade-Fehler:', err);
        setError('Inhalt konnte nicht geladen werden.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doc.id, tenant.organizationId, user.id]);

  // Nachweis schreiben + Status setzen
  const speichereNachweis = async (richtig, gesamt) => {
    const jetzt = new Date();
    const nachweisId = `${user.personal}-${doc.nr}-${jetzt.getTime()}`.replace(/\s+/g, '');
    const { error: e1 } = await supabase.from('nachweise').insert({
      ma_id: user.id,
      dok_id: doc.id,
      revision_id: revision ? revision.id : null,
      score: richtig,
      total: gesamt,
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
  };

  // Reine Gelesen-Bestätigung (Fallback ohne Quiz)
  const handleGelesen = async () => {
    setSaving(true);
    try {
      await speichereNachweis(1, 1);
      setStatus('abgeschlossen');
    } catch (err) {
      console.error('Bestätigung fehlgeschlagen:', err);
      setError('Bestätigung konnte nicht gespeichert werden. Bitte erneut versuchen.');
    } finally {
      setSaving(false);
    }
  };

  // Quiz auswerten
  const handleQuizAbschluss = async () => {
    const richtig = fragen.reduce((sum, f) => sum + (auswahl[f.id] === f.richtig ? 1 : 0), 0);
    const gesamt = fragen.length;
    const bestanden = richtig / gesamt >= BESTEHENS_QUOTE;
    setErgebnis({ richtig, gesamt, bestanden });
    setPhase('ergebnis');

    if (bestanden) {
      setSaving(true);
      try {
        await speichereNachweis(richtig, gesamt);
        setStatus('abgeschlossen');
      } catch (err) {
        console.error('Nachweis fehlgeschlagen:', err);
        setError('Ergebnis konnte nicht gespeichert werden.');
      } finally {
        setSaving(false);
      }
    }
  };

  const quizNeustart = () => {
    setFragen((prev) => prev.map((f) => ({ ...f, optionen: shuffle(f.optionen) })));
    setAuswahl({});
    setFrageIdx(0);
    setErgebnis(null);
    setPhase('quiz');
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
    backBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: t.primaryColor, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 32 },
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

    // Aktions-Boxen
    aktionBox: { marginTop: 32, padding: 28, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, textAlign: 'center' },
    aktionTitle: { fontSize: 18, fontWeight: 700, color: t.text, margin: 0, marginBottom: 8 },
    aktionText: { fontSize: 14, color: t.textMuted, margin: 0, marginBottom: 20, lineHeight: 1.6 },
    primaryBtn: { padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', color: '#FFFFFF', background: t.primaryColor, border: 'none', borderRadius: 10, cursor: 'pointer' },
    doneBox: { marginTop: 32, padding: 28, background: '#0F766E0A', border: '1px solid #0F766E40', borderRadius: 12, textAlign: 'center' },
    doneIcon: { fontSize: 40, marginBottom: 8 },
    doneTitle: { fontSize: 18, fontWeight: 700, color: '#0F766E', margin: 0, marginBottom: 4 },
    doneText: { fontSize: 13, color: t.textMuted, margin: 0 },

    // Quiz
    quizBox: { marginTop: 32, padding: '32px 40px', background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 },
    quizProgress: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: t.textMuted, textTransform: 'uppercase', marginBottom: 8 },
    progressBar: { height: 6, background: t.bgSubtle, borderRadius: 3, overflow: 'hidden', marginBottom: 28 },
    progressFill: { height: '100%', background: t.primaryColor, transition: 'width 0.3s' },
    quizFrage: { fontSize: 21, fontWeight: 700, color: t.text, margin: 0, marginBottom: 24, lineHeight: 1.4 },
    optionBtn: (gewaehlt) => ({
      display: 'block', width: '100%', textAlign: 'left', padding: '16px 20px', marginBottom: 12,
      fontSize: 15, fontFamily: 'inherit', fontWeight: gewaehlt ? 600 : 400,
      color: gewaehlt ? t.primaryColor : t.text,
      background: gewaehlt ? `${t.primaryColor}0F` : t.surface,
      border: `1.5px solid ${gewaehlt ? t.primaryColor : t.border}`,
      borderRadius: 10, cursor: 'pointer', transition: 'all 0.12s',
    }),
    quizFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
    quizNav: { display: 'flex', gap: 12 },
    navBtn: { padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', color: t.text, background: 'transparent', border: `1px solid ${t.border}`, borderRadius: 10, cursor: 'pointer' },
    navBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },

    // Ergebnis
    ergebnisBox: (ok) => ({ marginTop: 32, padding: 36, background: ok ? '#0F766E0A' : '#FEF3E2', border: `1px solid ${ok ? '#0F766E40' : '#F5C77E'}`, borderRadius: 12, textAlign: 'center' }),
    ergebnisIcon: { fontSize: 48, marginBottom: 12 },
    ergebnisTitle: (ok) => ({ fontSize: 24, fontWeight: 700, color: ok ? '#0F766E' : '#B45309', margin: 0, marginBottom: 8 }),
    ergebnisScore: { fontSize: 16, color: t.text, margin: 0, marginBottom: 8, fontWeight: 600 },
    ergebnisText: { fontSize: 14, color: t.textMuted, margin: 0, marginBottom: 24, lineHeight: 1.6 },
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
  const hatQuiz = fragen.length > 0;
  const aktuelleFrage = fragen[frageIdx];
  const alleBeantwortet = fragen.length > 0 && fragen.every((f) => auswahl[f.id] !== undefined);

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
        <button onClick={onBack} style={styles.backBtn}>← Zurück zur Übersicht</button>

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
            {/* Volltext sichtbar, außer während laufendem Quiz */}
            {phase !== 'quiz' && (
              <div style={styles.contentBox}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {revision.inhalt || '_Kein Inhalt verfügbar._'}
                </ReactMarkdown>
              </div>
            )}

            {/* === Bereits erledigt === */}
            {erledigt && phase !== 'ergebnis' && (
              <div style={styles.doneBox}>
                <div style={styles.doneIcon}>✓</div>
                <h3 style={styles.doneTitle}>Bereits abgeschlossen</h3>
                <p style={styles.doneText}>Du hast diese Schulung erfolgreich abgeschlossen.</p>
              </div>
            )}

            {/* === Lesen-Phase: Aktion anbieten === */}
            {!erledigt && phase === 'lesen' && (
              <div style={styles.aktionBox}>
                {hatQuiz ? (
                  <>
                    <h3 style={styles.aktionTitle}>Verständnis prüfen</h3>
                    <p style={styles.aktionText}>
                      Bitte beantworte {fragen.length} {fragen.length === 1 ? 'Frage' : 'Fragen'} zu dieser Verfahrensanweisung.
                      Zum Bestehen sind mindestens {Math.round(BESTEHENS_QUOTE * 100)} % richtige Antworten nötig.
                    </p>
                    <button style={styles.primaryBtn} onClick={() => setPhase('quiz')}>Quiz starten</button>
                  </>
                ) : (
                  <>
                    <h3 style={styles.aktionTitle}>Schulung abschließen</h3>
                    <p style={styles.aktionText}>
                      Mit dem Klick bestätigst du, dass du diese Verfahrensanweisung vollständig gelesen und verstanden hast.
                    </p>
                    <button
                      style={{ ...styles.primaryBtn, opacity: saving ? 0.6 : 1, cursor: saving ? 'wait' : 'pointer' }}
                      onClick={handleGelesen}
                      disabled={saving}
                    >
                      {saving ? 'Wird gespeichert…' : '✓ Gelesen & verstanden'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* === Quiz-Phase === */}
            {phase === 'quiz' && aktuelleFrage && (
              <div style={styles.quizBox}>
                <div style={styles.quizProgress}>Frage {frageIdx + 1} von {fragen.length}</div>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${((frageIdx + 1) / fragen.length) * 100}%` }} />
                </div>

                <h3 style={styles.quizFrage}>{aktuelleFrage.frage}</h3>

                {aktuelleFrage.optionen.map((opt, i) => {
                  const gewaehlt = auswahl[aktuelleFrage.id] === opt;
                  return (
                    <button
                      key={i}
                      style={styles.optionBtn(gewaehlt)}
                      onClick={() => setAuswahl((prev) => ({ ...prev, [aktuelleFrage.id]: opt }))}
                    >
                      {opt}
                    </button>
                  );
                })}

                <div style={styles.quizFooter}>
                  <button
                    style={{ ...styles.navBtn, ...(frageIdx === 0 ? styles.navBtnDisabled : {}) }}
                    onClick={() => setFrageIdx((i) => Math.max(0, i - 1))}
                    disabled={frageIdx === 0}
                  >
                    ← Zurück
                  </button>
                  <div style={styles.quizNav}>
                    {frageIdx < fragen.length - 1 ? (
                      <button
                        style={{ ...styles.primaryBtn, ...(auswahl[aktuelleFrage.id] === undefined ? styles.navBtnDisabled : {}) }}
                        onClick={() => setFrageIdx((i) => i + 1)}
                        disabled={auswahl[aktuelleFrage.id] === undefined}
                      >
                        Weiter →
                      </button>
                    ) : (
                      <button
                        style={{ ...styles.primaryBtn, ...(!alleBeantwortet ? styles.navBtnDisabled : {}) }}
                        onClick={handleQuizAbschluss}
                        disabled={!alleBeantwortet}
                      >
                        Quiz abschließen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* === Ergebnis-Phase === */}
            {phase === 'ergebnis' && ergebnis && (
              <div style={styles.ergebnisBox(ergebnis.bestanden)}>
                <div style={styles.ergebnisIcon}>{ergebnis.bestanden ? '🎉' : '📚'}</div>
                <h3 style={styles.ergebnisTitle(ergebnis.bestanden)}>
                  {ergebnis.bestanden ? 'Bestanden!' : 'Noch nicht bestanden'}
                </h3>
                <p style={styles.ergebnisScore}>
                  {ergebnis.richtig} von {ergebnis.gesamt} Fragen richtig
                  ({Math.round((ergebnis.richtig / ergebnis.gesamt) * 100)} %)
                </p>
                <p style={styles.ergebnisText}>
                  {ergebnis.bestanden
                    ? 'Sehr gut! Diese Schulung ist jetzt abgeschlossen und dein Nachweis wurde dokumentiert.'
                    : `Zum Bestehen sind mindestens ${Math.round(BESTEHENS_QUOTE * 100)} % nötig. Lies die Verfahrensanweisung noch einmal in Ruhe durch und wiederhole das Quiz.`}
                </p>
                {ergebnis.bestanden ? (
                  <button style={styles.primaryBtn} onClick={onBack}>Zurück zur Übersicht</button>
                ) : (
                  <button style={styles.primaryBtn} onClick={quizNeustart}>Quiz wiederholen</button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
