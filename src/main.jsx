import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { detectTenantId } from './tenants/useTenant'
import { TenantBadge } from './tenants/TenantBadge'
import { WissenLogin } from './tenants/WissenLogin'

const tenantId = detectTenantId()
console.log('🎯 Aktueller Tenant:', tenantId)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {tenantId === 'wissen' ? <WissenLogin /> : <App />}
    <TenantBadge />
  </React.StrictMode>
)