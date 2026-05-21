// src/tenants/WissenApp.jsx
import { useState, useEffect } from 'react';
import { WissenLogin } from './WissenLogin';
import { WissenDashboard } from './WissenDashboard';

const STORAGE_KEY = 'wissen_user';

export function WissenApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Beim Mount: gespeicherten User aus localStorage laden
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Konnte gespeicherten User nicht lesen', err);
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (err) {
      console.error('Konnte User nicht in localStorage speichern', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return <WissenLogin onLogin={handleLogin} />;
  }

  return <WissenDashboard user={user} onLogout={handleLogout} />;
}