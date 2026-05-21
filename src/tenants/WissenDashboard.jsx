// src/tenants/WissenDashboard.jsx
import { useTenant } from './useTenant';

export function WissenDashboard({ user, onLogout }) {
  const tenant = useTenant();
  const t = tenant.theme;
  const b = tenant.branding;

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
    main: {
      maxWidth: 1200, margin: '0 auto', padding: '48px 32px',
    },
    hero: { marginBottom: 48 },
    heroTitle: {
      fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em',
      margin: 0, marginBottom: 8, color: t.text,
    },
    heroSubtext: {
      fontSize: 16, color: t.textMuted, margin: 0, lineHeight: 1.5,
    },
    sectionTitle: {
      fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.12em', color: t.textMuted, marginBottom: 16,
    },
    placeholderCard: {
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '48px 32px', textAlign: 'center',
    },
    placeholderIcon: { fontSize: 40, marginBottom: 16 },
    placeholderTitle: {
      fontSize: 18, fontWeight: 600, color: t.text,
      margin: 0, marginBottom: 8,
    },
    placeholderText: {
      fontSize: 14, color: t.textMuted, margin: 0, lineHeight: 1.6,
      maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
    },
  };

  const firstName = user.name.split(' ')[0];

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
            Hier findest du in Kürze deine zugewiesenen Schulungen und Unterweisungen.
          </p>
        </section>

        <div style={styles.sectionTitle}>Meine Schulungen</div>
        <div style={styles.placeholderCard}>
          <div style={styles.placeholderIcon}>📚</div>
          <h3 style={styles.placeholderTitle}>Schulungen folgen in Kürze</h3>
          <p style={styles.placeholderText}>
            Sobald dir Schulungen zugewiesen sind, erscheinen sie hier. Du wirst dann automatisch benachrichtigt.
          </p>
        </div>
      </main>
    </div>
  );
}