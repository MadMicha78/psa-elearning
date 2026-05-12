// src/tenants/useTenant.js
import { useMemo } from 'react';
import { tenants, DEFAULT_TENANT } from './config';

/**
 * Ermittelt die Tenant-ID:
 *   1. Query-Param ?tenant=wissen  (Dev / Codespace / Vercel-Preview)
 *   2. Subdomain wissen.*          (Production)
 *   3. Fallback: DEFAULT_TENANT
 */
export function detectTenantId() {
  if (typeof window === 'undefined') return DEFAULT_TENANT;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('tenant');
  if (fromQuery && tenants[fromQuery]) return fromQuery;

  const firstPart = window.location.hostname.split('.')[0];
  if (tenants[firstPart]) return firstPart;

  return DEFAULT_TENANT;
}

export function useTenant() {
  return useMemo(() => {
    const id = detectTenantId();
    return tenants[id];
  }, []);
}