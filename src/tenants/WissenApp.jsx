// src/tenants/WissenApp.jsx
import { useState, useEffect } from 'react';
import { WissenLogin } from './WissenLogin';
import { WissenDashboard } from './WissenDashboard';
import { WissenModulDetail } from './WissenModulDetail';
import { WissenStatus } from './WissenStatus';

const STORAGE_KEY = 'wissen_user';

export function WissenApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'status'

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch (err) {
      console.error(err);
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)); } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveDoc(null);
    setView('dashboard');
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) return null;
  if (!user) return <WissenLogin onLogin={handleLogin} />;

  // Detail-Ansicht einer Schulung
  if (activeDoc) {
    return (
      <WissenModulDetail
        doc={activeDoc}
        user={user}
        onBack={() => setActiveDoc(null)}
        onLogout={handleLogout}
      />
    );
  }

  // Status-Dashboard (nur Admin)
  if (view === 'status' && user.is_admin) {
    return (
      <WissenStatus
        user={user}
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <WissenDashboard
      user={user}
      onLogout={handleLogout}
      onOpenDoc={(doc) => setActiveDoc(doc)}
      onOpenStatus={() => setView('status')}
    />
  );
}
