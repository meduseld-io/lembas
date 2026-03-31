import { useEffect } from 'react';
import { Plus, Pencil, ArrowUpDown, Trash2, Star, CheckSquare } from 'lucide-react';
import './HelpModal.css';

export default function HelpModal({ onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="help-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="How to use Lembas">
      <div className="help-content" onClick={e => e.stopPropagation()}>
        <div className="help-header">
          <h3>How to use Lembas</h3>
          <button className="help-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="help-section">
          <div className="help-icon"><Plus size={20} /></div>
          <div>
            <p className="help-title">Add items</p>
            <p>Type a name and tap Add. If you have regulars saved, suggestions will appear as you type.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon"><Pencil size={20} /></div>
          <div>
            <p className="help-title">Edit an item</p>
            <p>Tap on any item to edit its name, quantity, last price, or aisle location.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon"><ArrowUpDown size={20} /></div>
          <div>
            <p className="help-title">Reorder items</p>
            <p>Press and hold an item to pick it up, then drag it to a new position.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon"><Trash2 size={20} /></div>
          <div>
            <p className="help-title">Delete an item</p>
            <p>While dragging, drop the item on the trash icon at the bottom. You can also delete from the edit screen.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon"><Star size={20} /></div>
          <div>
            <p className="help-title">Regular items</p>
            <p>Tap the star on any item to save it as a regular. Switch to the Regulars tab to quickly re-add saved items.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon"><CheckSquare size={20} /></div>
          <div>
            <p className="help-title">Check off items</p>
            <p>Tap the checkbox to mark items as done. Use "Clear checked" to remove them all at once.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
