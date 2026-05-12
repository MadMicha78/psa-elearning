// src/tenants/TenantBadge.jsx
// TEMPORÄRES Debug-Badge zur Theme-Visualisierung.
// Wird in Phase 2 entfernt, sobald das Theme aufs echte Layout angewendet ist.

import { useTenant } from './useTenant';

export function TenantBadge() {
  const tenant = useTenant();

  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        padding: '14px 18px',
        background: tenant.theme.primaryColor,
        color: 'white',
        borderRadius: 8,
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        zIndex: 9999,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        maxWidth: 280,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 2 }}>
        Tenant: {tenant.name}
      </div>
      <div style={{ fontSize: 11, opacity: 0.85 }}>
        ID: <code>{tenant.id}</code>
      </div>

      {tenant.branding.logo && (
        <div style={{ marginTop: 10 }}>
          <img
            src={tenant.branding.logo}
            alt={tenant.branding.logoAlt}
            style={{
              height: 36,
              background: 'white',
              padding: 6,
              borderRadius: 4,
            }}
          />
        </div>
      )}

      {tenant.branding.loginTitle && (
        <div style={{ marginTop: 10, fontSize: 12 }}>
          Titel: <strong>{tenant.branding.loginTitle}</strong>
        </div>
      )}
    </div>
  );
}