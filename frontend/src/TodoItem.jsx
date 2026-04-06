import { useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star } from 'lucide-react';
import './TodoItem.css';

export default function TodoItem({ item, onToggle, onDelete, onStar, starred, sortable = true }) {
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

  const mergedListeners = sortable && listeners ? {
    ...listeners,
    onPointerDown: (e) => {
      touchStart.current = { time: Date.now() };
      touchMoved.current = false;
      listeners.onPointerDown?.(e);
    },
  } : {};

  return (
    <div
      className={`todo-item ${item.done ? 'done' : ''} ${isDragging ? 'dragging' : ''}`}
      ref={setRef}
      style={style}
      {...attributes}
      {...mergedListeners}
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        aria-label={`Mark ${item.name} as ${item.done ? 'not done' : 'done'}`}
      />
      <span className="todo-name">{item.name}</span>
      {onStar && (
        <button
          className={`todo-star-btn ${starred ? 'starred' : ''}`}
          onClick={(e) => { e.stopPropagation(); onStar(); }}
          aria-label={starred ? 'Remove from regulars' : 'Add to regulars'}
        >
          <Star size={16} fill={starred ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}
