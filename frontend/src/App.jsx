import { useState, useCallback } from 'react';
import { useStorage } from './useStorage.js';
import ShoppingList from './ShoppingList.jsx';
import RegularsGrid from './RegularsGrid.jsx';
import './App.css';

export default function App() {
  const { items, setItems, regulars, setRegulars } = useStorage();
  const [tab, setTab] = useState('list');

  const addItem = useCallback((name, qty = 1) => {
    name = name.trim();
    if (!name) return;
    setItems(prev => {
      const existing = prev.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: Date.now(), name, qty, checked: false, price: '', aisle: '' }];
    });
  }, [setItems]);

  const toggleRegular = useCallback((name) => {
    setRegulars(prev => {
      const idx = prev.findIndex(r => r.toLowerCase() === name.toLowerCase());
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, name];
    });
  }, [setRegulars]);

  const isRegular = useCallback((name) => {
    return regulars.some(r => r.toLowerCase() === name.toLowerCase());
  }, [regulars]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/logo.png" alt="Lembas" />
        <h1>Lembas</h1>
      </header>

      <div className="tabs" role="tablist">
        <button
          className={`tab ${tab === 'list' ? 'active' : ''}`}
          role="tab"
          aria-selected={tab === 'list'}
          onClick={() => setTab('list')}
        >
          Shopping List
        </button>
        <button
          className={`tab ${tab === 'regulars' ? 'active' : ''}`}
          role="tab"
          aria-selected={tab === 'regulars'}
          onClick={() => setTab('regulars')}
        >
          Regulars
        </button>
      </div>

      <main className="app-main">
        {tab === 'list' ? (
          <ShoppingList
            items={items}
            setItems={setItems}
            addItem={addItem}
            regulars={regulars}
            toggleRegular={toggleRegular}
            isRegular={isRegular}
          />
        ) : (
          <RegularsGrid
            regulars={regulars}
            setRegulars={setRegulars}
            items={items}
            addItem={addItem}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} <a href="https://github.com/meduseld-io" target="_blank" rel="noopener noreferrer">meduseld.io</a></p>
      </footer>
    </div>
  );
}
