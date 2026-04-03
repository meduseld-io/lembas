import { useState, useCallback } from 'react';

const ITEMS_KEY = 'lembas_items';
const REGULARS_KEY = 'lembas_regulars';
const SHOPS_KEY = 'lembas_shops';
const TODOS_KEY = 'lembas_todos';
const MODE_KEY = 'lembas_mode';

function loadItems() {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return items
      .filter(item => !item.checked)
      .map(item => ({
        ...item,
        price: item.price ?? '',
        aisle: item.aisle ?? '',
      }));
  } catch (e) {
    console.error('Failed to load items from localStorage:', e);
    return [];
  }
}

function loadRegulars() {
  try {
    const raw = localStorage.getItem(REGULARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load regulars from localStorage:', e);
    return [];
  }
}

function loadShops() {
  try {
    const raw = localStorage.getItem(SHOPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load shops from localStorage:', e);
    return [];
  }
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(TODOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load todos from localStorage:', e);
    return [];
  }
}

function loadMode() {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    return raw === 'shopping' ? 'shopping' : 'todo';
  } catch (e) {
    console.error('Failed to load mode from localStorage:', e);
    return 'todo';
  }
}

export function useStorage() {
  const [items, setItemsState] = useState(loadItems);
  const [regulars, setRegularsState] = useState(loadRegulars);
  const [shops, setShopsState] = useState(loadShops);
  const [todos, setTodosState] = useState(loadTodos);
  const [mode, setModeState] = useState(loadMode);

  const setItems = useCallback((updater) => {
    setItemsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(ITEMS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setRegulars = useCallback((updater) => {
    setRegularsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(REGULARS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setShops = useCallback((updater) => {
    setShopsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(SHOPS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTodos = useCallback((updater) => {
    setTodosState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(TODOS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);
  }, []);

  return { items, setItems, regulars, setRegulars, shops, setShops, todos, setTodos, mode, setMode };
}
