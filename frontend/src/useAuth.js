import { useState, useEffect, useRef } from 'react';
import { MeduseldAuth } from './meduseld-auth.js';

const auth = new MeduseldAuth('lembas');

export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    auth.init().then((u) => {
      setUser(u);
      setReady(true);
    });
    return auth.onAuthChange(({ user: u }) => setUser(u));
  }, []);

  function login() {
    auth.login();
  }

  function logout() {
    auth.logout();
  }

  async function syncData(localData, localUpdatedAt) {
    if (!user) return { source: 'none', data: localData };
    return auth.sync(localData, localUpdatedAt);
  }

  async function saveData(data) {
    if (!user) return false;
    return auth.saveData(data);
  }

  async function loadData() {
    if (!user) return null;
    return auth.loadData();
  }

  return { user, ready, login, logout, syncData, saveData, loadData, isAuthenticated: !!user };
}
