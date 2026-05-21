// src/tenants/config.js

export const tenants = {
  schulung: {
    id: 'schulung',
    name: 'PSArbeitssicherheit',
    organizationId: '8410c976-9a2e-48cb-a33d-439f5771d64c',
    theme: { primaryColor: '#c0392b' },
    branding: {},
  },
  wissen: {
    id: 'wissen',
    name: 'PSA Sicherheitstechnik',
    organizationId: '1f88ac51-3c50-450d-a4eb-2cef07b94062',
    theme: {
      primaryColor: '#353D92',
      primaryColorDark: '#1F2566',
      primaryColorLight: '#5B63B8',
      bg: '#FFFFFF',
      bgSubtle: '#F5F6F8',
      surface: '#FFFFFF',
      border: '#E5E7EB',
      borderStrong: '#CBD5E1',
      text: '#0F172A',
      textMuted: '#64748B',
      textOnPrimary: '#FFFFFF',
    },
    branding: {
      logo: '/tenants/wissen/logo.png',
      logoAlt: 'PSA Sicherheitstechnik',
      loginTitle: 'Wissen & Unterweisung PSA',
      welcomeText: 'Zugang zu Wissen PSA',
      welcomeSubtext: 'Schulungen und Unterweisungen für PSA Sicherheitstechnik.',
      loginButton: 'Login starten',
      formLabel: {
        name: 'Name',
        namePlaceholder: 'Vorname Nachname',
        personalNr: 'Personalnummer',
        personalNrPlaceholder: 'z.B. MA-001',
      },
      footerNote: 'Schulungsnachweise werden sicher gespeichert',
    },
  },
};

export const DEFAULT_TENANT = 'schulung';