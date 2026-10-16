import { useState, useCallback, useEffect } from 'react';

const ITEMS_KEY = 'lembas_items';
const REGULARS_KEY = 'lembas_regulars';
const SHOPS_KEY = 'lembas_shops';
const MODE_KEY = 'lembas_mode';
const LISTS_KEY = 'lembas_lists';
const ACTIVE_LIST_KEY = 'lembas_active_list';

const DEFAULT_LISTS = [{ id: 'tasks', name: 'Tasks' }];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    // Every stored collection is an array; anything else is damaged data
    if (Array.isArray(fallback) && !Array.isArray(value)) return fallback;
    return value;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
}

function loadItems() {
  return load(ITEMS_KEY, []).filter(i => i && !i.checked).map(i => ({
    ...i, price: i.price ?? '', aisle: i.aisle ?? '',
  }));
}

function loadRegulars() {
  return load(REGULARS_KEY, []).filter(r => typeof r === 'string');
}

function loadShops() {
  return load(SHOPS_KEY, []).filter(s => s && Array.isArray(s.items));
}

function loadMode() {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw === 'todo') return 'lists';
    if (raw === 'shopping' || raw === 'lists') return raw;
    return 'shopping';
  } catch (e) {
    console.error('Failed to load mode from localStorage:', e);
    return 'shopping';
  }
}

function loadLists() {
  const lists = load(LISTS_KEY, []).filter(l => l && l.id);
  if (lists.length) {
    // Ensure each list has items and regulars arrays
    return lists.map(l => ({
      ...l,
      items: Array.isArray(l.items) ? l.items : [],
      regulars: Array.isArray(l.regulars) ? l.regulars : [],
    }));
  }
  // Migrate old todos into the default Tasks list
  const oldTodos = load('lembas_todos', []);
  const defaultLists = DEFAULT_LISTS.map(l => ({ ...l, regulars: [] }));
  if (oldTodos.length) {
    defaultLists[0].items = oldTodos;
  }
  return defaultLists;
}

function loadActiveList() {
  try {
    const raw = localStorage.getItem(ACTIVE_LIST_KEY);
    return raw || 'tasks';
  } catch (e) {
    console.error('Failed to load active list from localStorage:', e);
    return 'tasks';
  }
}

export function useStorage() {
  const [items, setItemsState] = useState(loadItems);
  const [regulars, setRegularsState] = useState(loadRegulars);
  const [shops, setShopsState] = useState(loadShops);
  const [mode, setModeState] = useState(loadMode);
  const [lists, setListsState] = useState(loadLists);
  const [activeListId, setActiveListIdState] = useState(loadActiveList);

  const setItems = useCallback((updater) => {
    setItemsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(ITEMS_KEY, next);
      return next;
    });
  }, []);

  const setRegulars = useCallback((updater) => {
    setRegularsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(REGULARS_KEY, next);
      return next;
    });
  }, []);

  const setShops = useCallback((updater) => {
    setShopsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(SHOPS_KEY, next);
      return next;
    });
  }, []);

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    save(MODE_KEY, newMode);
  }, []);

  const setLists = useCallback((updater) => {
    setListsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      save(LISTS_KEY, next);
      return next;
    });
  }, []);

  const setActiveListId = useCallback((id) => {
    setActiveListIdState(id);
    save(ACTIVE_LIST_KEY, id);
  }, []);

  // Another tab or window changed storage: reload so this tab doesn't overwrite it
  useEffect(() => {
    function handleStorage(e) {
      if (e.storageArea !== localStorage) return;
      if (e.key === null || e.key === ITEMS_KEY) setItemsState(loadItems());
      if (e.key === null || e.key === REGULARS_KEY) setRegularsState(loadRegulars());
      if (e.key === null || e.key === SHOPS_KEY) setShopsState(loadShops());
      if (e.key === null || e.key === MODE_KEY) setModeState(loadMode());
      if (e.key === null || e.key === LISTS_KEY) setListsState(loadLists());
      if (e.key === null || e.key === ACTIVE_LIST_KEY) setActiveListIdState(loadActiveList());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    items, setItems,
    regulars, setRegulars,
    shops, setShops,
    mode, setMode,
    lists, setLists,
    activeListId, setActiveListId,
  };
}
