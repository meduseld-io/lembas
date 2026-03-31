import { useState, useCallback } from 'react';

const ITEMS_KEY = 'lembas_items';
const REGULARS_KEY = 'lembas_regulars';
const SHOPS_KEY = 'lembas_shops';

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

export function useStorage() {
  const [items, setItemsState] = useState(loadItems);
  const [regulars, setRegularsState] = useState(loadRegulars);
  const [shops, setShopsState] = useState(loadShops);

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

  return { items, setItems, regulars, setRegulars, shops, setShops };
}
