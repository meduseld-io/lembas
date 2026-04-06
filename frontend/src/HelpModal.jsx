import { useEffect } from 'react';
import { Plus, Pencil, ArrowUpDown, Trash2, Star, CheckSquare, ShoppingBag, ListChecks, ShoppingCart, GripVertical } from 'lucide-react';
import './HelpModal.css';

export default function HelpModal({ onClose, mode }) {
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
          <div className="help-icon"><ShoppingCart size={20} /></div>
          <div>
            <p className="help-title">Modes</p>
            <p>Switch between To-Do and Shopping modes using the icons in the header. Your data is saved separately for each mode.</p>
          </div>
        </div>

        {mode === 'todo' ? (
          <>
            <div className="help-section">
              <div className="help-icon"><Plus size={20} /></div>
              <div>
                <p className="help-title">Add tasks</p>
                <p>Type a task name and tap Add to create it.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><Pencil size={20} /></div>
              <div>
                <p className="help-title">Edit a task</p>
                <p>Tap on any task to rename it or delete it.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><CheckSquare size={20} /></div>
              <div>
                <p className="help-title">Complete tasks</p>
                <p>Tap the checkbox to mark a task as done. Completed tasks move to the bottom of the list.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><ArrowUpDown size={20} /></div>
              <div>
                <p className="help-title">Reorder tasks</p>
                <p>Drag the <GripVertical size={14} style={{verticalAlign: 'middle'}} /> grip icon to pick up a task and move it to a new position.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><Trash2 size={20} /></div>
              <div>
                <p className="help-title">Delete tasks</p>
                <p>Drag a task using the grip icon and drop it on the trash icon at the bottom. You can also clear all completed tasks at once.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><Star size={20} /></div>
              <div>
                <p className="help-title">Regular tasks</p>
                <p>Tap the star on any task to save it as a regular. Switch to the Regulars tab to quickly re-add saved tasks.</p>
              </div>
            </div>
          </>
        ) : (
          <>
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
                <p>Drag the <GripVertical size={14} style={{verticalAlign: 'middle'}} /> grip icon to pick up an item and move it to a new position.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><Trash2 size={20} /></div>
              <div>
                <p className="help-title">Delete an item</p>
                <p>Drag an item using the grip icon and drop it on the trash icon at the bottom. You can also delete from the edit screen.</p>
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
                <p className="help-title">Complete items</p>
                <p>Tap the checkbox to mark an item as bought. Completed items are grouped into a shop for that day with a running total.</p>
              </div>
            </div>

            <div className="help-section">
              <div className="help-icon"><ShoppingBag size={20} /></div>
              <div>
                <p className="help-title">Shop history</p>
                <p>Previous shops appear below your list. Tap to expand and see what was bought. Drag items onto a past shop to add them retroactively.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
