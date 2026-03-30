import { useState, useRef, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import ItemRow from './ItemRow.jsx';
import EditModal from './EditModal.jsx';
import './ShoppingList.css';

export default function ShoppingList({ items, setItems, addItem, regulars, toggleRegular, isRegular }) {
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [editingItem, setEditingItem] = useState(null);
  const inputRef = useRef(null);

  const unchecked = useMemo(() => items.filter(i => !i.checked), [items]);
  const checked = useMemo(() => items.filter(i => i.checked), [items]);
  const total = items.length;
  const done = checked.length;

  const suggestions = useMemo(() => {
    const val = inputVal.trim().toLowerCase();
    if (!val) return [];
    return regulars.filter(r => r.toLowerCase().includes(val));
  }, [inputVal, regulars]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleAdd() {
    addItem(inputVal);
    setInputVal('');
    setShowSuggestions(false);
    setHighlightIdx(-1);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        addItem(suggestions[highlightIdx]);
        setInputVal('');
        setShowSuggestions(false);
        setHighlightIdx(-1);
      } else {
        handleAdd();
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!suggestions.length) return;
      setHighlightIdx(prev => {
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        let next = prev + dir;
        if (next < 0) next = suggestions.length - 1;
        if (next >= suggestions.length) next = 0;
        return next;
      });
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  function handleInputChange(e) {
    setInputVal(e.target.value);
    setHighlightIdx(-1);
    setShowSuggestions(e.target.value.trim().length > 0);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleCheck(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  function handleDelete(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleQty(id, delta) {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.qty + delta;
      return newQty >= 1 ? { ...i, qty: newQty } : i;
    }));
  }

  function handleSaveEdit(updated) {
    setItems(prev => prev.map(i => i.id === updated.id ? { ...i, ...updated } : i));
    setEditingItem(null);
  }

  function clearChecked() {
    setItems(prev => prev.filter(i => !i.checked));
  }

  return (
    <div className="container">
      <div className="add-bar">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => { if (inputVal.trim()) setShowSuggestions(true); }}
          placeholder="Add an item..."
          autoComplete="off"
          aria-label="Item name"
        />
        <button onClick={handleAdd} aria-label="Add item">Add</button>
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions show">
            {suggestions.map((s, i) => (
              <div
                key={s}
                className={`suggestion-item ${i === highlightIdx ? 'highlighted' : ''}`}
                onMouseDown={() => { addItem(s); setInputVal(''); setShowSuggestions(false); }}
              >
                <span className="star">★</span>{s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="list-header">
        <h2>Items {total > 0 && <span>({done}/{total})</span>}</h2>
        {done > 0 && (
          <button className="clear-btn" onClick={clearChecked}>Clear checked</button>
        )}
      </div>

      {!items.length ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>Your list is empty.<br />Add items above or pick from your regulars.</p>
        </div>
      ) : (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={unchecked.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {unchecked.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                  onQty={handleQty}
                  onStar={() => toggleRegular(item.name)}
                  starred={isRegular(item.name)}
                  onTap={() => setEditingItem(item)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {checked.length > 0 && (
            <>
              <div className="section-label">Done</div>
              {checked.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                  onQty={handleQty}
                  onStar={() => toggleRegular(item.name)}
                  starred={isRegular(item.name)}
                  onTap={() => setEditingItem(item)}
                  sortable={false}
                />
              ))}
            </>
          )}
        </>
      )}

      {editingItem && (
        <EditModal
          item={editingItem}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
          onDelete={() => { handleDelete(editingItem.id); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
