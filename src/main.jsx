import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { detectTenantId } from './tenants/useTenant'
import { TenantBadge } from './tenants/TenantBadge'

// TEMPORÄR – fliegt später raus
console.log('🎯 Aktueller Tenant:', detectTenantId())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <TenantBadge />
  </React.StrictMode>
)