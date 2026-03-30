import { useMemo } from 'react';
import './RegularsGrid.css';

export default function RegularsGrid({ regulars, setRegulars, items, addItem }) {
  const sorted = useMemo(() => [...regulars].sort((a, b) => a.localeCompare(b)), [regulars]);

  function isInList(name) {
    return items.some(i => i.name.toLowerCase() === name.toLowerCase());
  }

  function removeRegular(name) {
    setRegulars(prev => prev.filter(r => r.toLowerCase() !== name.toLowerCase()));
  }

  if (!regulars.length) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon">⭐</div>
          <p>No regular items yet.<br />Star items from your shopping list to save them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <p className="regulars-info">
        Tap a regular item to add it to your current list. Star items from the shopping list to save them here.
      </p>
      <div className="regulars-grid">
        {sorted.map(name => (
          <div
            key={name}
            className={`regular-chip ${isInList(name) ? 'in-list' : ''}`}
            onClick={() => addItem(name)}
            role="button"
            tabIndex={0}
          >
            <span>{name}</span>
            <button
              className="remove-regular"
              onClick={e => { e.stopPropagation(); removeRegular(name); }}
              aria-label={`Remove ${name} from regulars`}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
