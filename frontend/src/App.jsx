import { useState, useCallback } from 'react';
import { useStorage } from './useStorage.js';
import { ShoppingCart, LayoutList, Plus, ChevronDown, Pencil, Trash2, X } from 'lucide-react';
import ShoppingList from './ShoppingList.jsx';
import RegularsGrid from './RegularsGrid.jsx';
import TodoList from './TodoList.jsx';
import HelpModal from './HelpModal.jsx';
import './App.css';

export default function App() {
  const {
    items, setItems, regulars, setRegulars, shops, setShops,
    mode, setMode, lists, setLists, activeListId, setActiveListId,
  } = useStorage();
  const [tab, setTab] = useState('list');
  const [showHelp, setShowHelp] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editListName, setEditListName] = useState('');

  const activeList = lists.find(l => l.id === activeListId) || lists[0];
  const activeItems = activeList?.items || [];

  // Per-mode regulars: shopping uses top-level regulars, lists mode uses per-list regulars
  const activeRegulars = mode === 'lists' ? (activeList?.regulars || []) : regulars;

  const setActiveRegulars = useCallback((updater) => {
    if (mode === 'lists') {
      setLists(prev => prev.map(l => {
        if (l.id !== activeListId) return l;
        const regs = l.regulars || [];
        const next = typeof updater === 'function' ? updater(regs) : updater;
        return { ...l, regulars: next };
      }));
    } else {
      setRegulars(updater);
    }
  }, [mode, activeListId, setLists, setRegulars]);

  const setActiveItems = useCallback((updater) => {
    setLists(prev => prev.map(l => {
      if (l.id !== activeListId) return l;
      const items = l.items || [];
      const next = typeof updater === 'function' ? updater(items) : updater;
      return { ...l, items: next };
    }));
  }, [setLists, activeListId]);

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

  const addListItem = useCallback((name) => {
    name = name.trim();
    if (!name) return;
    setActiveItems(prev => {
      const existing = prev.find(t => t.name.toLowerCase() === name.toLowerCase() && !t.done);
      if (existing) return prev;
      return [...prev, { id: Date.now(), name, done: false }];
    });
  }, [setActiveItems]);

  const toggleRegular = useCallback((name) => {
    setActiveRegulars(prev => {
      const idx = prev.findIndex(r => r.toLowerCase() === name.toLowerCase());
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, name];
    });
  }, [setActiveRegulars]);

  const isRegular = useCallback((name) => {
    return activeRegulars.some(r => r.toLowerCase() === name.toLowerCase());
  }, [activeRegulars]);

  function handleAddList(e) {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    setLists(prev => [...prev, { id, name, items: [], regulars: [] }]);
    setActiveListId(id);
    setNewListName('');
    setShowAddList(false);
    setShowListPicker(false);
  }

  function handleDeleteList(id) {
    if (lists.length <= 1) return;
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeListId === id) {
      const remaining = lists.filter(l => l.id !== id);
      setActiveListId(remaining[0]?.id || 'tasks');
    }
  }

  function handleRenameList(e) {
    e.preventDefault();
    const name = editListName.trim();
    if (!name || !editingListId) return;
    setLists(prev => prev.map(l => l.id === editingListId ? { ...l, name } : l));
    setEditingListId(null);
    setEditListName('');
  }

  function startEditList(l) {
    setEditingListId(l.id);
    setEditListName(l.name);
  }

  const listTabLabel = mode === 'lists' ? activeList?.name || 'List' : 'Shopping List';

  return (
    <div className="app-shell">
      <header className="app-header">
        <img src="/logo.png" alt="Lembas" />
        <h1>Lembas</h1>
        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === 'shopping' ? 'active' : ''}`}
            onClick={() => { setMode('shopping'); setTab('list'); setShowListPicker(false); }}
            aria-label="Shopping mode"
          >
            <ShoppingCart size={16} />
          </button>
          <button
            className={`mode-btn ${mode === 'lists' ? 'active' : ''}`}
            onClick={() => { setMode('lists'); setTab('list'); }}
            aria-label="Lists mode"
          >
            <LayoutList size={16} />
          </button>
        </div>
        <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="Help">?</button>
      </header>

      {mode === 'lists' && (
        <div className="list-picker-bar">
          <button className="list-picker-toggle" onClick={() => setShowListPicker(!showListPicker)}>
            <span>{activeList?.name || 'Select list'}</span>
            <ChevronDown size={14} className={showListPicker ? 'chevron-open' : ''} />
          </button>
          {showListPicker && (
            <div className="list-picker-dropdown">
              {lists.map(l => (
                <div key={l.id} className={`list-picker-item ${l.id === activeListId ? 'active' : ''}`}>
                  {editingListId === l.id ? (
                    <form onSubmit={handleRenameList} className="list-rename-form">
                      <input
                        type="text"
                        value={editListName}
                        onChange={e => setEditListName(e.target.value)}
                        autoFocus
                        onBlur={() => setEditingListId(null)}
                        onKeyDown={e => { if (e.key === 'Escape') setEditingListId(null); }}
                      />
                    </form>
                  ) : (
                    <span
                      className="list-picker-name"
                      onClick={() => { setActiveListId(l.id); setShowListPicker(false); }}
                    >
                      {l.name}
                      {l.items?.filter(i => !i.done).length > 0 && (
                        <span className="list-count">{l.items.filter(i => !i.done).length}</span>
                      )}
                    </span>
                  )}
                  <div className="list-picker-actions">
                    <button onClick={() => startEditList(l)} aria-label={`Rename ${l.name}`}><Pencil size={12} /></button>
                    {lists.length > 1 && (
                      <button onClick={() => handleDeleteList(l.id)} aria-label={`Delete ${l.name}`}><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              ))}
              {showAddList ? (
                <form onSubmit={handleAddList} className="list-add-form">
                  <input
                    type="text"
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    placeholder="List name..."
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Escape') { setShowAddList(false); setNewListName(''); } }}
                  />
                  <button type="submit" aria-label="Create list"><Plus size={14} /></button>
                  <button type="button" onClick={() => { setShowAddList(false); setNewListName(''); }} aria-label="Cancel"><X size={14} /></button>
                </form>
              ) : (
                <button className="list-add-btn" onClick={() => setShowAddList(true)}>
                  <Plus size={14} /> New list
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className={`tabs ${mode === 'lists' ? 'with-picker' : ''}`} role="tablist">
        <button
          className={`tab ${tab === 'list' ? 'active' : ''}`}
          role="tab"
          aria-selected={tab === 'list'}
          onClick={() => setTab('list')}
        >
          {listTabLabel}
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

      <main className="app-main" onClick={() => showListPicker && setShowListPicker(false)}>
        {tab === 'regulars' ? (
          <RegularsGrid
            regulars={activeRegulars}
            setRegulars={setActiveRegulars}
            items={mode === 'lists' ? activeItems.filter(t => !t.done) : items}
            addItem={mode === 'lists' ? addListItem : addItem}
            mode={mode}
          />
        ) : mode === 'lists' ? (
          <TodoList
            todos={activeItems}
            setTodos={setActiveItems}
            regulars={activeRegulars}
            toggleRegular={toggleRegular}
            isRegular={isRegular}
          />
        ) : (
          <ShoppingList
            items={items}
            setItems={setItems}
            addItem={addItem}
            regulars={activeRegulars}
            toggleRegular={toggleRegular}
            isRegular={isRegular}
            shops={shops}
            setShops={setShops}
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
