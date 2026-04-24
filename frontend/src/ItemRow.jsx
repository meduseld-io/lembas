import { useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star } from 'lucide-react';
import './ItemRow.css';

export default function ItemRow({ item, onCheck, onQty, onStar, starred, onTap, sortable = true }) {
  const touchStart = useRef(null);
  const touchMoved = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !sortable });

  const setRef = useCallback((node) => {
    setSortableRef(node);
  }, [setSortableRef]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  function handlePointerDown(e) {
    touchStart.current = { time: Date.now(), target: e.target };
    touchMoved.current = false;
  }

  function handlePointerMove() {
    touchMoved.current = true;
  }

  function handlePointerUp() {
    if (!touchMoved.current && touchStart.current && !isDragging) {
      const elapsed = Date.now() - touchStart.current.time;
      const t = touchStart.current.target;
      const isInteractive = t.type === 'checkbox' || t.closest?.('.qty-controls') || t.closest?.('.item-actions') || t.closest?.('.drag-handle');
      if (elapsed < 250 && !isInteractive) {
        onTap();
      }
    }
    touchStart.current = null;
  }

  return (
    <div
      className={`item ${item.checked ? 'checked' : ''} ${isDragging ? 'dragging' : ''}`}
      ref={setRef}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {sortable && (
        <div className="drag-handle" {...listeners} style={{ touchAction: 'none' }}>
          <GripVertical size={16} />
        </div>
      )}
      <input
        type="checkbox"
        checked={item.checked}
        onChange={() => onCheck(item.id)}
        aria-label={`Mark ${item.name} as done`}
      />
      <div className="item-content" aria-label={`Edit ${item.name}`}>
        <div className="item-name-row">
          <span className="item-name">{item.name}</span>
          {item.aisle && <span className="meta-aisle">{item.aisle}</span>}
        </div>
        {item.price && <span className="meta-price">${item.price}</span>}
      </div>
      <div className="qty-controls">
        <button className="qty-btn" onClick={() => onQty(item.id, -1)} aria-label="Decrease quantity">−</button>
        <span className="qty-val">{item.qty}</span>
        <button className="qty-btn" onClick={() => onQty(item.id, 1)} aria-label="Increase quantity">+</button>
      </div>
      <div className="item-actions">
        <button
          className={`item-btn star-btn ${starred ? 'starred' : ''}`}
          onClick={(e) => { e.stopPropagation(); onStar(); }}
          aria-label={starred ? 'Remove from regulars' : 'Add to regulars'}
        ><Star size={20} fill={starred ? 'currentColor' : 'none'} /></button>
      </div>
    </div>
  );
}
