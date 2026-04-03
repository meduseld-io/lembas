import { useState, useCallback } from 'react';
import { useStorage } from './useStorage.js';
import { ShoppingCart, ListChecks } from 'lucide-react';
import ShoppingList from './ShoppingList.jsx';
import RegularsGrid from './RegularsGrid.jsx';
import TodoList from './TodoList.jsx';
import HelpModal from './HelpModal.jsx';
import './App.css';

export default function App() {
  const { items, setItems, regulars, setRegulars, shops, setShops, todos, setTodos, mode, setMode } = useStorage();
  const [tab, setTab] = useState('list');
  const [showHelp, setShowHelp] = useState(false);

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
        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === 'todo' ? 'active' : ''}`}
            onClick={() => setMode('todo')}
            aria-label="To-Do mode"
            data-tooltip="To-Do"
          >
            <ListChecks size={16} />
          </button>
          <button
            className={`mode-btn ${mode === 'shopping' ? 'active' : ''}`}
            onClick={() => setMode('shopping')}
            aria-label="Shopping mode"
            data-tooltip="Shopping"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="Help">?</button>
      </header>

      {mode === 'shopping' && (
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
      )}

      <main className="app-main">
        {mode === 'todo' ? (
          <TodoList todos={todos} setTodos={setTodos} />
        ) : tab === 'list' ? (
          <ShoppingList
            items={items}
            setItems={setItems}
            addItem={addItem}
            regulars={regulars}
            toggleRegular={toggleRegular}
            isRegular={isRegular}
            shops={shops}
            setShops={setShops}
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

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} mode={mode} />}
    </div>
  );
}
