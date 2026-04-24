import { useState, useCallback } from 'react';

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
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
}

function loadItems() {
  return load(ITEMS_KEY, []).filter(i => !i.checked).map(i => ({
    ...i, price: i.price ?? '', aisle: i.aisle ?? '',
  }));
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
  const lists = load(LISTS_KEY, null);
  if (lists && lists.length) return lists;
  // Migrate old todos into the default Tasks list
  const oldTodos = load('lembas_todos', []);
  const defaultLists = DEFAULT_LISTS.map(l => ({ ...l }));
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
  const [regulars, setRegularsState] = useState(() => load(REGULARS_KEY, []));
  const [shops, setShopsState] = useState(() => load(SHOPS_KEY, []));
  const [mode, setModeState] = useState(loadMode);
  const [lists, setListsState] = useState(loadLists);
  const [activeListId, setActiveListIdState] = useState(loadActiveList);

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

  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);
  }, []);

  const setLists = useCallback((updater) => {
    setListsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(LISTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setActiveListId = useCallback((id) => {
    setActiveListIdState(id);
    localStorage.setItem(ACTIVE_LIST_KEY, id);
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
