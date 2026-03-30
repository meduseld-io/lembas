import { useRef, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './ItemRow.css';

const SWIPE_THRESHOLD = 80;

export default function ItemRow({ item, onCheck, onDelete, onQty, onStar, starred, onTap, sortable = true }) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
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

  const rowRef = useRef(null);

  const setRef = useCallback((node) => {
    rowRef.current = node;
    setSortableRef(node);
  }, [setSortableRef]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    touchMoved.current = false;
  }

  function handleTouchMove(e) {
    if (!touchStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;

    // If vertical scroll is dominant, bail out
    if (!swiping && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      touchStart.current = null;
      return;
    }

    if (Math.abs(dx) > 10) {
      touchMoved.current = true;
      setSwiping(true);
      // Only allow left swipe (negative)
      setSwipeX(Math.min(0, dx));
    }
  }

  function handleTouchEnd() {
    if (swiping) {
      if (Math.abs(swipeX) > SWIPE_THRESHOLD) {
        onDelete(item.id);
      } else {
        setSwipeX(0);
      }
      setSwiping(false);
    } else if (!touchMoved.current && touchStart.current) {
      const elapsed = Date.now() - touchStart.current.time;
      if (elapsed < 300) {
        onTap();
      }
    }
    touchStart.current = null;
  }

  const deleteRevealed = Math.abs(swipeX) > SWIPE_THRESHOLD * 0.5;

  return (
    <div className="item-swipe-wrapper" ref={setRef} style={style} {...attributes}>
      <div
        className={`item-delete-bg ${deleteRevealed ? 'revealed' : ''}`}
        aria-hidden="true"
      >
        <span>Delete</span>
      </div>
      <div
        className={`item ${item.checked ? 'checked' : ''}`}
        style={{ transform: `translateX(${swipeX}px)`, transition: swiping ? 'none' : 'transform 0.2s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          // Desktop click-to-edit (only on the name area)
          if (e.target.closest('.qty-controls') || e.target.closest('.item-actions') || e.target.type === 'checkbox' || e.target.closest('.drag-handle')) return;
          onTap();
        }}
      >
        {sortable && (
          <button className="drag-handle" {...listeners} aria-label="Drag to reorder">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
              <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
              <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
            </svg>
          </button>
        )}
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onCheck(item.id)}
          aria-label={`Mark ${item.name} as done`}
        />
        <div className="item-content" role="button" tabIndex={0} aria-label={`Edit ${item.name}`}>
          <span className="item-name">{item.name}</span>
          {(item.price || item.aisle) && (
            <span className="item-meta">
              {item.price && <span className="meta-price">${item.price}</span>}
              {item.price && item.aisle && <span className="meta-sep"> · </span>}
              {item.aisle && <span className="meta-aisle">{item.aisle}</span>}
            </span>
          )}
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
          >★</button>
        </div>
      </div>
    </div>
  );
}
