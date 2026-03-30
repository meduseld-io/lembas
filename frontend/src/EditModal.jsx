import { useState, useEffect, useRef } from 'react';
import './EditModal.css';

export default function EditModal({ item, onSave, onClose, onDelete }) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty);
  const [price, setPrice] = useState(item.price || '');
  const [aisle, setAisle] = useState(item.aisle || '');
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  // Close on Escape
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
    onSave({
      id: item.id,
      name: name.trim(),
      qty: Math.max(1, qty),
      price: price.trim(),
      aisle: aisle.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit item">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Item</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="edit-name">Name</label>
            <input
              ref={nameRef}
              id="edit-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="edit-qty">Quantity</label>
            <input
              id="edit-qty"
              type="number"
              min="1"
              value={qty}
              onChange={e => setQty(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="field">
            <label htmlFor="edit-price">Last Price</label>
            <input
              id="edit-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="e.g. 3.49"
            />
          </div>
          <div className="field">
            <label htmlFor="edit-aisle">Aisle / Location</label>
            <input
              id="edit-aisle"
              type="text"
              value={aisle}
              onChange={e => setAisle(e.target.value)}
              placeholder="e.g. Aisle 5, Dairy section"
            />
          </div>
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
