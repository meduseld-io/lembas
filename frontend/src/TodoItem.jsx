import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Star } from 'lucide-react';
import './TodoItem.css';

export default function TodoItem({ item, onToggle, onDelete, onStar, starred, onTap, sortable = true }) {
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

  return (
    <div
      className={`todo-item ${item.done ? 'done' : ''} ${isDragging ? 'dragging' : ''}`}
      ref={setRef}
      style={style}
      {...attributes}
    >
      {sortable && (
        <div className="drag-handle" {...listeners} style={{ touchAction: 'none' }}>
          <GripVertical size={16} />
        </div>
      )}
      <input
        type="checkbox"
        checked={item.done}
        onChange={() => onToggle(item.id)}
        aria-label={`Mark ${item.name} as ${item.done ? 'not done' : 'done'}`}
      />
      <span className="todo-name" onClick={() => onTap && onTap()}>{item.name}</span>
      {onStar && (
        <button
          className={`todo-star-btn ${starred ? 'starred' : ''}`}
          onClick={(e) => { e.stopPropagation(); onStar(); }}
          aria-label={starred ? 'Remove from regulars' : 'Add to regulars'}
        >
          <Star size={18} fill={starred ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}
