import { useState, useEffect } from 'react';
import './EditModal.css';

export default function TodoEditModal({ item, onSave, onClose, onDelete, lists, currentListId, onMove }) {
  const [name, setName] = useState(item.name);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: item.id, name: name.trim() });
  }

  // Other lists this item can be moved to
  const otherLists = lists ? lists.filter(l => l.id !== currentListId) : [];

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit task">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="edit-todo-name">Task name</label>
            <input
              id="edit-todo-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          {otherLists.length > 0 && (
            <div className="field">
              <label htmlFor="edit-todo-move">Move to list</label>
              <select
                id="edit-todo-move"
                defaultValue=""
                onChange={e => {
                  if (e.target.value) onMove(item.id, e.target.value);
                }}
              >
                <option value="" disabled>Select a list...</option>
                {otherLists.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn-delete" onClick={onDelete}>Delete</button>
            <div className="modal-actions-right">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-save">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
