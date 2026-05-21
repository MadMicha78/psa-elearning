// src/tenants/WissenLogin.jsx
import { useState } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '../supabase';

export function WissenLogin({ onLogin }) {
  const tenant = useTenant();
  const [name, setName] = useState('');
  const [personal, setPersonal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = tenant.theme;
  const b = tenant.branding;

  const styles = {
    root: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      background: t.bg,
      color: t.text,
    },
    hero: {
      flex: '1 1 50%',
      background: `linear-gradient(135deg, ${t.primaryColor} 0%, ${t.primaryColorDark} 100%)`,
      color: t.textOnPrimary,
      padding: '64px 56px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '100vh',
    },
    heroLogoBox: {
      display: 'inline-block',
      background: 'white',
      padding: '14px 20px',
      borderRadius: 10,
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      alignSelf: 'flex-start',
    },
    heroLogoImg: { height: 52, display: 'block' },
    heroContent: { maxWidth: 540 },
    heroTitle: {
      fontSize: 56, fontWeight: 800, lineHeight: 1.05,
      letterSpacing: '-0.025em', margin: 0, marginBottom: 24,
    },
    heroSubtext: {
      fontSize: 19, lineHeight: 1.55, opacity: 0.92,
      margin: 0, maxWidth: 480, fontWeight: 400,
    },
    heroFooter: {
      fontSize: 12, opacity: 0.65, letterSpacing: '0.12em',
      textTransform: 'uppercase', fontWeight: 600,
    },
    formSide: {
      flex: '1 1 50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px', background: t.bgSubtle, minHeight: '100vh',
    },
    formCard: {
      width: '100%', maxWidth: 440,
      background: t.surface, padding: '52px 48px',
      borderRadius: 16, boxShadow: '0 4px 28px rgba(15, 27, 45, 0.06)',
      border: `1px solid ${t.border}`,
    },
    formTitle: {
      fontSize: 30, fontWeight: 700, letterSpacing: '-0.015em',
      margin: 0, marginBottom: 8, color: t.text,
    },
    formSubtitle: {
      fontSize: 14, color: t.textMuted, margin: 0,
      marginBottom: 32, lineHeight: 1.5,
    },
    label: {
      display: 'block', fontSize: 13, fontWeight: 600,
      color: t.text, marginBottom: 8, letterSpacing: '0.02em',
    },
    input: {
      width: '100%', padding: '14px 16px', fontSize: 15,
      fontFamily: 'inherit', color: t.text, background: t.bg,
      border: `1.5px solid ${t.borderStrong}`, borderRadius: 10,
      outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%', padding: '14px 20px', fontSize: 15,
      fontWeight: 600, fontFamily: 'inherit', color: t.textOnPrimary,
      background: t.primaryColor, border: 'none', borderRadius: 10,
      cursor: 'pointer', marginTop: 28,
      transition: 'background 0.15s', letterSpacing: '0.01em',
    },
    errorBox: {
      marginTop: 16, padding: '12px 14px',
      background: '#FEE2E2', color: '#991B1B',
      borderRadius: 8, fontSize: 13, lineHeight: 1.5,
    },
    footer: {
      fontSize: 12, color: t.textMuted, textAlign: 'center',
      marginTop: 24, lineHeight: 1.5,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !personal.trim()) {
      setError('Bitte beide Felder ausfüllen.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error: supaError } = await supabase
      .from('mitarbeiter')
      .select('*')
      .eq('personal', personal.trim())
      .ilike('name', name.trim())
      .eq('organization_id', tenant.organizationId)
      .single();

    setLoading(false);

    if (supaError || !data) {
      setError('Mitarbeiter nicht gefunden. Bitte Name und Personalnummer prüfen.');
      return;
    }

    if (onLogin) {
      onLogin(data);
    } else {
      console.log('✅ Login erfolgreich:', data);
      alert(`Willkommen, ${data.name}!\n\nPersonal: ${data.personal}\nAbteilung: ${data.abt}\nAdmin: ${data.is_admin ? 'Ja' : 'Nein'}`);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.hero}>
        <div style={styles.heroLogoBox}>
          <img src={b.logo} alt={b.logoAlt} style={styles.heroLogoImg} />
        </div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{b.welcomeText}</h1>
          <p style={styles.heroSubtext}>{b.welcomeSubtext}</p>
        </div>
        <div style={styles.heroFooter}>{tenant.name}</div>
      </div>

      <div style={styles.formSide}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{b.loginTitle}</h2>
          <p style={styles.formSubtitle}>
            Bitte mit Name und Personalnummer anmelden, um auf Schulungen und Unterweisungen zuzugreifen.
          </p>

          <form onSubmit={handleSubmit}>
            <label style={styles.label} htmlFor="name">{b.formLabel.name}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={b.formLabel.namePlaceholder}
              style={styles.input}
              disabled={loading}
              autoFocus
            />

            <label style={{ ...styles.label, marginTop: 20 }} htmlFor="personalNr">
              {b.formLabel.personalNr}
            </label>
            <input
              id="personalNr"
              type="text"
              value={personal}
              onChange={(e) => setPersonal(e.target.value)}
              placeholder={b.formLabel.personalNrPlaceholder}
              style={styles.input}
              disabled={loading}
            />

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Anmelden…' : b.loginButton}
            </button>
          </form>

          <p style={styles.footer}>{b.footerNote}</p>
        </div>
      </div>
    </div>
  );
}