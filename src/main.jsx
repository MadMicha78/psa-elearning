import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { detectTenantId } from './tenants/useTenant'
import { TenantBadge } from './tenants/TenantBadge'
import { WissenApp } from './tenants/WissenApp'

const tenantId = detectTenantId()
console.log('🎯 Aktueller Tenant:', tenantId)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {tenantId === 'wissen' ? <WissenApp /> : <App />}
    <TenantBadge />
  </React.StrictMode>
)