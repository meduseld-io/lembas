import { useState, useRef, useMemo, useCallback } from 'react';
import { DndContext, closestCenter, pointerWithin, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Trash2, ShoppingCart, Star as StarIcon } from 'lucide-react';
import ItemRow from './ItemRow.jsx';
import ShopCard from './ShopCard.jsx';
import EditModal from './EditModal.jsx';
import './ShoppingList.css';

function DeleteZone() {
  const { isOver, setNodeRef } = useDroppable({ id: 'delete-zone' });
  return (
    <div ref={setNodeRef} className={`delete-zone ${isOver ? 'over' : ''}`}>
      <Trash2 size={24} />
    </div>
  );
}

export default function ShoppingList({ items, setItems, addItem, regulars, toggleRegular, isRegular, shops, setShops }) {
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [editingItem, setEditingItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const total = items.length;

  const estimatedTotal = useMemo(() => {
    return items.reduce((sum, i) => {
      const p = parseFloat(i.price);
      return sum + (isNaN(p) ? 0 : p * (i.qty || 1));
    }, 0);
  }, [items]);

  const suggestions = useMemo(() => {
    const val = inputVal.trim().toLowerCase();
    if (!val) return [];
    return regulars.filter(r => r.toLowerCase().includes(val));
  }, [inputVal, regulars]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } })
  );

  // Use pointerWithin for delete/shop zones (checks if pointer is inside the droppable),
  // closestCenter for sortable items
  const collisionDetection = useCallback((args) => {
    const zoneHit = pointerWithin({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        c => c.id === 'delete-zone' || String(c.id).startsWith('shop-')
      ),
    });
    if (zoneHit.length > 0) return zoneHit;
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        c => c.id !== 'delete-zone' && !String(c.id).startsWith('shop-')
      ),
    });
  }, []);

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

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(event) {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;

    if (over.id === 'delete-zone') {
      setItems(prev => prev.filter(i => i.id !== active.id));
      return;
    }

    // Dropped on a shop card
    if (typeof over.id === 'string' && over.id.startsWith('shop-')) {
      const shopId = parseInt(over.id.replace('shop-', ''));
      const item = items.find(i => i.id === active.id);
      if (!item) return;
      setShops(prev => prev.map(s => {
        if (s.id !== shopId) return s;
        return { ...s, items: [...s.items, { name: item.name, qty: item.qty, price: item.price, aisle: item.aisle }] };
      }));
      setItems(prev => prev.filter(i => i.id !== active.id));
      return;
    }

    if (active.id !== over.id) {
      setItems(prev => {
        const oldIndex = prev.findIndex(i => i.id === active.id);
        const newIndex = prev.findIndex(i => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleDragCancel() {
    setIsDragging(false);
  }

  function handleCheck(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const today = new Date().toISOString().split('T')[0];
    setShops(prev => {
      const existing = prev.find(s => s.date === today);
      const shopItem = { name: item.name, qty: item.qty, price: item.price, aisle: item.aisle };
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, items: [...s.items, shopItem] } : s);
      }
      return [{ id: Date.now(), date: today, items: [shopItem] }, ...prev];
    });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleDelete(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function handleDeleteShop(shopId) {
    setShops(prev => prev.filter(s => s.id !== shopId));
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
                <span className="star"><StarIcon size={14} fill="currentColor" /></span>{s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="list-header">
        <h2>Items {total > 0 && <span>({total})</span>}</h2>
        {estimatedTotal > 0 && (
          <span className="estimated-total">Est. ${estimatedTotal.toFixed(2)}</span>
        )}
      </div>

      {!items.length && !shops.length ? (
        <div className="empty">
          <div className="empty-icon"><ShoppingCart size={40} /></div>
          <p>Your list is empty.<br />Add items above or pick from your regulars.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {items.length > 0 && (
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onCheck={handleCheck}
                  onQty={handleQty}
                  onStar={() => toggleRegular(item.name)}
                  starred={isRegular(item.name)}
                  onTap={() => setEditingItem(item)}
                />
              ))}
            </SortableContext>
          )}

          {!items.length && (
            <div className="empty empty-sm">
              <p>All items completed. Add more above.</p>
            </div>
          )}

          {shops.length > 0 && (
            <>
              <div className="section-label">Previous Shops</div>
              {shops.map(shop => (
                <ShopCard key={shop.id} shop={shop} onDelete={handleDeleteShop} />
              ))}
            </>
          )}

          {isDragging && <DeleteZone />}
        </DndContext>
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
