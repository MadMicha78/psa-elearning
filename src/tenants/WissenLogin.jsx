// src/tenants/WissenLogin.jsx
import { useState } from 'react';
import { useTenant } from './useTenant';

export function WissenLogin() {
  const tenant = useTenant();
  const [personalNr, setPersonalNr] = useState('');
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
    heroLogoImg: {
      height: 52,
      display: 'block',
    },
    heroContent: {
      maxWidth: 540,
    },
    heroTitle: {
      fontSize: 56,
      fontWeight: 800,
      lineHeight: 1.05,
      letterSpacing: '-0.025em',
      margin: 0,
      marginBottom: 24,
    },
    heroSubtext: {
      fontSize: 19,
      lineHeight: 1.55,
      opacity: 0.92,
      margin: 0,
      maxWidth: 480,
      fontWeight: 400,
    },
    heroFooter: {
      fontSize: 12,
      opacity: 0.65,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    formSide: {
      flex: '1 1 50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px',
      background: t.bgSubtle,
      minHeight: '100vh',
    },
    formCard: {
      width: '100%',
      maxWidth: 440,
      background: t.surface,
      padding: '52px 48px',
      borderRadius: 16,
      boxShadow: '0 4px 28px rgba(15, 27, 45, 0.06)',
      border: `1px solid ${t.border}`,
    },
    formTitle: {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: '-0.015em',
      margin: 0,
      marginBottom: 8,
      color: t.text,
    },
    formSubtitle: {
      fontSize: 14,
      color: t.textMuted,
      margin: 0,
      marginBottom: 32,
      lineHeight: 1.5,
    },
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: t.text,
      marginBottom: 8,
      letterSpacing: '0.02em',
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      fontSize: 15,
      fontFamily: 'inherit',
      color: t.text,
      background: t.bg,
      border: `1.5px solid ${t.borderStrong}`,
      borderRadius: 10,
      outline: 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '14px 20px',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: 'inherit',
      color: t.textOnPrimary,
      background: t.primaryColor,
      border: 'none',
      borderRadius: 10,
      cursor: 'pointer',
      marginTop: 28,
      transition: 'background 0.15s, transform 0.05s',
      letterSpacing: '0.01em',
    },
    footer: {
      fontSize: 12,
      color: t.textMuted,
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 1.5,
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt for:', personalNr);
    alert(`Login-Logik (Magic-Link) kommt in Phase 3.\n\nEingegeben: ${personalNr || '(leer)'}`);
  };

  return (
    <div style={styles.root}>
      {/* HERO – linke Seite */}
      <div style={styles.hero}>
        <div style={styles.heroLogoBox}>
          <img src={b.logo} alt={b.logoAlt} style={styles.heroLogoImg} />
        </div>

        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>{b.welcomeText}</h1>
          <p style={styles.heroSubtext}>{b.welcomeSubtext}</p>
        </div>

        <div style={styles.heroFooter}>
          {tenant.name}
        </div>
      </div>

      {/* FORM – rechte Seite */}
      <div style={styles.formSide}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>{b.loginTitle}</h2>
          <p style={styles.formSubtitle}>Bitte mit Personalnummer anmelden, um auf Schulungen und Unterweisungen zuzugreifen.</p>

          <form onSubmit={handleSubmit}>
            <label style={styles.label} htmlFor="personalNr">
              {b.formLabel.personalNr}
            </label>
            <input
              id="personalNr"
              type="text"
              value={personalNr}
              onChange={(e) => setPersonalNr(e.target.value)}
              placeholder={b.formLabel.personalNrPlaceholder}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = t.primaryColor;
                e.target.style.boxShadow = `0 0 0 3px ${t.primaryColor}1a`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = t.borderStrong;
                e.target.style.boxShadow = 'none';
              }}
              autoFocus
            />

            <button
              type="submit"
              style={styles.button}
              onMouseEnter={(e) => { e.target.style.background = t.primaryColorDark; }}
              onMouseLeave={(e) => { e.target.style.background = t.primaryColor; }}
            >
              {b.loginButton}
            </button>
          </form>

          <p style={styles.footer}>{b.footerNote}</p>
        </div>
      </div>
    </div>
  );
}