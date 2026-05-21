// src/tenants/WissenApp.jsx
import { useState, useEffect } from 'react';
import { WissenLogin } from './WissenLogin';
import { WissenDashboard } from './WissenDashboard';
import { WissenModulDetail } from './WissenModulDetail';

const STORAGE_KEY = 'wissen_user';

export function WissenApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null);

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
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) return null;
  if (!user) return <WissenLogin onLogin={handleLogin} />;

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

  return (
    <WissenDashboard
      user={user}
      onLogout={handleLogout}
      onOpenDoc={(doc) => setActiveDoc(doc)}
    />
  );
}