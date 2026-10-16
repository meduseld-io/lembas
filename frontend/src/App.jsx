import { useState, useCallback } from 'react';
import { useStorage } from './useStorage.js';
import { newId } from './ids.js';
import { ShoppingCart, LayoutList, Plus, ChevronDown, Pencil, Trash2, X } from 'lucide-react';
import ShoppingList from './ShoppingList.jsx';
import RegularsGrid from './RegularsGrid.jsx';
import TodoList from './TodoList.jsx';
import HelpModal from './HelpModal.jsx';
import DesktopBanner from './DesktopBanner.jsx';
import './App.css';

// Lists mode has no tabs — the list picker dropdown is the only navigation.

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
  // The saved id can point at a list that no longer exists; always write to the list on screen
  const currentListId = activeList?.id;
  const activeItems = activeList?.items || [];

  // Per-mode regulars: shopping uses top-level regulars, each list has its own
  const activeRegulars = mode === 'lists' ? (activeList?.regulars || []) : regulars;

  const setActiveRegulars = useCallback((updater) => {
    if (mode === 'lists') {
      setLists(prev => prev.map(l => {
        if (l.id !== currentListId) return l;
        const regs = l.regulars || [];
        const next = typeof updater === 'function' ? updater(regs) : updater;
        return { ...l, regulars: next };
      }));
    } else {
      setRegulars(updater);
    }
  }, [mode, currentListId, setLists, setRegulars]);

  const setActiveItems = useCallback((updater) => {
    setLists(prev => prev.map(l => {
      if (l.id !== currentListId) return l;
      const current = l.items || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...l, items: next };
    }));
  }, [setLists, currentListId]);

  const addItem = useCallback((name, qty = 1) => {
    name = name.trim();
    if (!name) return;
    setItems(prev => {
      const existing = prev.find(i => i.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        return prev.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: newId(), name, qty, checked: false, price: '', aisle: '' }];
    });
  }, [setItems]);

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
    const id = newId();
    setLists(prev => [...prev, { id, name, items: [], regulars: [] }]);
    setActiveListId(id);
    setNewListName('');
    setShowAddList(false);
    setShowListPicker(false);
  }

  function handleDeleteList(id) {
    if (lists.length <= 1) return;
    const list = lists.find(l => l.id === id);
    const count = list?.items?.length || 0;
    if (!window.confirm(`Delete "${list?.name}"${count ? ` and its ${count} item${count === 1 ? '' : 's'}` : ''}?`)) return;
    setLists(prev => prev.filter(l => l.id !== id));
    if (currentListId === id) {
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
            onClick={() => { setMode('lists'); setTab('list'); setShowListPicker(false); }}
            aria-label="Lists mode"
          >
            <LayoutList size={16} />
          </button>
        </div>
        <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="Help">?</button>
      </header>

      <DesktopBanner />

      {mode === 'lists' && (
        <div className="list-picker-bar">
          <button className="list-picker-toggle" onClick={() => setShowListPicker(!showListPicker)}>
            <span>{activeList?.name || 'Select list'}</span>
            <ChevronDown size={14} className={showListPicker ? 'chevron-open' : ''} />
          </button>
          {showListPicker && (
            <>
            <div className="list-picker-backdrop" onClick={() => setShowListPicker(false)} />
            <div className="list-picker-dropdown">
              {lists.map(l => (
                <div key={l.id} className={`list-picker-item ${l.id === currentListId ? 'active' : ''}`}>
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
            </>
          )}
        </div>
      )}

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
        {mode === 'lists' ? (
          <TodoList
            todos={activeItems}
            setTodos={setActiveItems}
            regulars={activeRegulars}
            toggleRegular={toggleRegular}
            isRegular={isRegular}
            lists={lists}
            activeListId={currentListId}
            onMoveItem={(itemId, targetListId) => {
              const item = activeItems.find(t => t.id === itemId);
              if (!item) return;
              setActiveItems(prev => prev.filter(t => t.id !== itemId));
              setLists(prev => prev.map(l => {
                if (l.id !== targetListId) return l;
                const target = l.items || [];
                // Already on the target list and not done: don't add a second copy
                if (target.some(t => !t.done && t.name.toLowerCase() === item.name.toLowerCase())) return l;
                return { ...l, items: [...target, { ...item, done: false }] };
              }));
            }}
          />
        ) : tab === 'regulars' ? (
          <RegularsGrid
            regulars={activeRegulars}
            setRegulars={setActiveRegulars}
            items={items}
            addItem={addItem}
            mode={mode}
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
