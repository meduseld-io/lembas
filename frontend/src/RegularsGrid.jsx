import { useMemo } from 'react';
import { Star } from 'lucide-react';
import './RegularsGrid.css';

export default function RegularsGrid({ regulars, setRegulars, items, addItem, mode }) {
  const sorted = useMemo(() => [...regulars].sort((a, b) => a.localeCompare(b)), [regulars]);

  function isInList(name) {
    return items.some(i => i.name.toLowerCase() === name.toLowerCase());
  }

  function removeRegular(name) {
    setRegulars(prev => prev.filter(r => r.toLowerCase() !== name.toLowerCase()));
  }

  const listLabel = mode === 'lists' ? 'list' : 'shopping list';

  if (!regulars.length) {
    return (
      <div className="container">
        <div className="empty">
          <div className="empty-icon"><Star size={40} /></div>
          <p>No regular items yet.<br />Star items from your {listLabel} to save them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <p className="regulars-info">
        Tap a regular item to add it to your current list. Star items from the {listLabel} to save them here.
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
