import { useState, useRef } from 'react';
import { pointerFromEvent } from './pointer.js';

// Tracks the pointer during a dnd-kit drag so a drop on the fixed trash zone can delete the item.
// The trash zone is not a droppable, so the drop check uses the last pointer position.
export function useDragToDelete() {
  const [isDragging, setIsDragging] = useState(false);
  const [overDelete, setOverDelete] = useState(false);
  const deleteZoneRef = useRef(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const removeListeners = useRef(null);

  function isPointerOverDelete() {
    const el = deleteZoneRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const { x, y } = lastPointer.current;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function stop() {
    removeListeners.current?.();
    removeListeners.current = null;
    setIsDragging(false);
    setOverDelete(false);
    document.body.style.overflow = '';
  }

  function startDrag(event) {
    removeListeners.current?.();
    setIsDragging(true);
    setOverDelete(false);
    document.body.style.overflow = 'hidden';
    // Start from where this drag began, not where the last one ended
    lastPointer.current = pointerFromEvent(event.activatorEvent);
    const onPointerMove = (e) => {
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setOverDelete(isPointerOverDelete());
    };
    window.addEventListener('pointermove', onPointerMove);
    removeListeners.current = () => window.removeEventListener('pointermove', onPointerMove);
  }

  // Ends the drag and reports whether it was dropped on the trash zone
  function endDrag() {
    const droppedOnDelete = isPointerOverDelete();
    stop();
    return droppedOnDelete;
  }

  return { deleteZoneRef, isDragging, overDelete, startDrag, endDrag, cancelDrag: stop };
}
