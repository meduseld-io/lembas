import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import './ShopCard.css';

export default function ShopCard({ shop, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const { isOver, setNodeRef } = useDroppable({ id: `shop-${shop.id}` });

  const dateStr = new Date(shop.date).toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const total = shop.items.reduce((sum, i) => {
    const p = parseFloat(i.price);
    return sum + (isNaN(p) ? 0 : p * (i.qty || 1));
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={`shop-card ${isOver ? 'shop-card-over' : ''}`}
    >
      <div className="shop-header" onClick={() => setExpanded(!expanded)}>
        <span className="shop-chevron">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="shop-info">
          <span className="shop-date">{dateStr}</span>
          <span className="shop-count">{shop.items.length} item{shop.items.length !== 1 ? 's' : ''}</span>
        </div>
        {total > 0 && <span className="shop-total">${total.toFixed(2)}</span>}
        <button
          className="shop-delete"
          onClick={(e) => { e.stopPropagation(); onDelete(shop.id); }}
          aria-label="Delete shop"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {expanded && (
        <div className="shop-items">
          {shop.items.map((item, i) => (
            <div key={i} className="shop-item">
              <span className="shop-item-name">{item.name}</span>
              {item.qty > 1 && <span className="shop-item-qty">x{item.qty}</span>}
              {item.price && <span className="shop-item-price">${item.price}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
