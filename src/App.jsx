import { useState, useEffect } from 'react'
import { globalCss } from './theme.js'
import AdminApp from './AdminApp.jsx'
import EmployeeApp from './EmployeeApp.jsx'

export default function App() {
  const [mode, setMode] = useState(null) // 'admin' | 'employee'

  useEffect(() => {
    // Check URL param: ?admin=1 for admin panel
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === '1') {
      setMode('admin')
    } else {
      setMode('employee')
    }
  }, [])

  return (
    <>
      <style>{globalCss}</style>
      {mode === 'admin'    && <AdminApp />}
      {mode === 'employee' && <EmployeeApp />}
    </>
  )
}
