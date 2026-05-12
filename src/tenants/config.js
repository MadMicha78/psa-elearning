// src/tenants/config.js
// Multi-Tenant-Konfiguration. Jeder Tenant entspricht einer Subdomain:
//   wissen.psarbeitssicherheit.de   → tenants.wissen
//   schulung.psarbeitssicherheit.de → tenants.schulung

export const tenants = {
  schulung: {
    id: 'schulung',
    name: 'PSArbeitssicherheit',
    theme: {
      primaryColor: '#c0392b', // PSA-Rot
    },
    branding: {
      // Aktuell noch hartcodiert in EmployeeApp.jsx – Migration in späterer Phase
    },
  },

  wissen: {
    id: 'wissen',
    name: 'PSA Sicherheitstechnik',
    theme: {
      primaryColor: '#353D92',   // PSA-Blau (Maike)
      brandTeal: '#0F766E',      // Akzent aus Mockup
      brandTealLight: '#14B8A6',
      navy: '#0F1B2D',           // Sidebar-Hintergrund
      bg: '#F7F8FA',
      surface: '#FFFFFF',
      border: '#E5E7EB',
      text: '#0F172A',
      textMuted: '#64748B',
    },
    branding: {
      logo: '/tenants/wissen/logo.png',
      logoAlt: 'PSA Sicherheitstechnik',
      loginTitle: 'Wissensportal',
      loginSubtitle: 'PSA Sicherheitstechnik',
    },
  },
};

export const DEFAULT_TENANT = 'schulung';