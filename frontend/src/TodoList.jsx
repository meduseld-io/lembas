import { useState, useRef, useCallback } from 'react';
import { DndContext, closestCenter, rectIntersection, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Trash2, ListChecks } from 'lucide-react';
import TodoItem from './TodoItem.jsx';
import './TodoList.css';

function DeleteZone() {
  const { isOver, setNodeRef } = useDroppable({ id: 'delete-zone' });
  return (
    <div ref={setNodeRef} className={`delete-zone ${isOver ? 'over' : ''}`}>
      <Trash2 size={24} />
    </div>
  );
}

export default function TodoList({ todos, setTodos }) {
  const [inputVal, setInputVal] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const pending = todos.filter(t => !t.done);
  const completed = todos.filter(t => t.done);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 300, tolerance: 5 } })
  );

  const collisionDetection = useCallback((args) => {
    const deleteHit = rectIntersection({
      ...args,
      droppableContainers: args.droppableContainers.filter(c => c.id === 'delete-zone'),
    });
    if (deleteHit.length > 0) return deleteHit;
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(c => c.id !== 'delete-zone'),
    });
  }, []);

  function handleAdd() {
    const name = inputVal.trim();
    if (!name) return;
    setTodos(prev => [...prev, { id: Date.now(), name, done: false }]);
    setInputVal('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
  }

  function handleToggle(id) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function handleDelete(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  function handleClearCompleted() {
    setTodos(prev => prev.filter(t => !t.done));
  }

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(event) {
    setIsDragging(false);
    const { active, over } = event;
    if (!over) return;
    if (over.id === 'delete-zone') {
      setTodos(prev => prev.filter(t => t.id !== active.id));
      return;
    }
    if (active.id !== over.id) {
      setTodos(prev => {
        const oldIndex = prev.findIndex(t => t.id === active.id);
        const newIndex = prev.findIndex(t => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleDragCancel() {
    setIsDragging(false);
  }

  return (
    <div className="container">
      <div className="add-bar">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          autoComplete="off"
          aria-label="Task name"
        />
        <button onClick={handleAdd} aria-label="Add task">Add</button>
      </div>

      <div className="list-header">
        <h2>Tasks {pending.length > 0 && <span>({pending.length})</span>}</h2>
      </div>

      {!todos.length ? (
        <div className="empty">
          <div className="empty-icon"><ListChecks size={40} /></div>
          <p>No tasks yet.<br />Add something above to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {pending.length > 0 && (
            <SortableContext items={pending.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {pending.map(todo => (
                <TodoItem key={todo.id} item={todo} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </SortableContext>
          )}

          {pending.length === 0 && completed.length > 0 && (
            <div className="empty empty-sm">
              <p>All done. Nice work.</p>
            </div>
          )}

          {completed.length > 0 && (
            <>
              <div className="section-label todo-completed-header">
                <span>Completed ({completed.length})</span>
                <button className="clear-completed-btn" onClick={handleClearCompleted}>Clear</button>
              </div>
              {completed.map(todo => (
                <TodoItem key={todo.id} item={todo} onToggle={handleToggle} onDelete={handleDelete} sortable={false} />
              ))}
            </>
          )}

          {isDragging && <DeleteZone />}
        </DndContext>
      )}
    </div>
  );
}
