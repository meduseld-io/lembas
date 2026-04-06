import { useState, useRef, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Trash2, ListChecks, Star as StarIcon } from 'lucide-react';
import TodoItem from './TodoItem.jsx';
import './TodoList.css';

export default function TodoList({ todos, setTodos, regulars, toggleRegular, isRegular }) {
  const [inputVal, setInputVal] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [overDelete, setOverDelete] = useState(false);
  const inputRef = useRef(null);
  const deleteZoneRef = useRef(null);
  const lastPointer = useRef({ x: 0, y: 0 });

  const pending = todos.filter(t => !t.done);
  const completed = todos.filter(t => t.done);

  const suggestions = useMemo(() => {
    const val = inputVal.trim().toLowerCase();
    if (!val) return [];
    return regulars.filter(r => r.toLowerCase().includes(val));
  }, [inputVal, regulars]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function isPointerOverDelete() {
    const el = deleteZoneRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const { x, y } = lastPointer.current;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function addTodo(name) {
    name = (name || inputVal).trim();
    if (!name) return;
    setTodos(prev => {
      const existing = prev.find(t => t.name.toLowerCase() === name.toLowerCase() && !t.done);
      if (existing) return prev;
      return [...prev, { id: Date.now(), name, done: false }];
    });
    setInputVal('');
    setShowSuggestions(false);
    setHighlightIdx(-1);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        addTodo(suggestions[highlightIdx]);
      } else {
        addTodo();
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!suggestions.length) return;
      setHighlightIdx(prev => {
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        let next = prev + dir;
        if (next < 0) next = suggestions.length - 1;
        if (next >= suggestions.length) next = 0;
        return next;
      });
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }

  function handleInputChange(e) {
    setInputVal(e.target.value);
    setHighlightIdx(-1);
    setShowSuggestions(e.target.value.trim().length > 0);
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
    setOverDelete(false);
    const onPointerMove = (e) => {
      lastPointer.current = { x: e.clientX, y: e.clientY };
      setOverDelete(isPointerOverDelete());
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const droppedOnDelete = isPointerOverDelete();

    setIsDragging(false);
    setOverDelete(false);

    if (droppedOnDelete) {
      setTodos(prev => prev.filter(t => t.id !== active.id));
      return;
    }

    if (!over) return;
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
    setOverDelete(false);
  }

  return (
    <div className="container">
      <div className="add-bar">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => { if (inputVal.trim()) setShowSuggestions(true); }}
          placeholder="Add a task..."
          autoComplete="off"
          aria-label="Task name"
        />
        <button onClick={() => addTodo()} aria-label="Add task">Add</button>
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions show">
            {suggestions.map((s, i) => (
              <div
                key={s}
                className={`suggestion-item ${i === highlightIdx ? 'highlighted' : ''}`}
                onMouseDown={() => { addTodo(s); }}
              >
                <span className="star"><StarIcon size={14} fill="currentColor" /></span>{s}
              </div>
            ))}
          </div>
        )}
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
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {pending.length > 0 && (
            <SortableContext items={pending.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {pending.map(todo => (
                <TodoItem
                  key={todo.id}
                  item={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onStar={() => toggleRegular(todo.name)}
                  starred={isRegular(todo.name)}
                />
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
                <TodoItem
                  key={todo.id}
                  item={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onStar={() => toggleRegular(todo.name)}
                  starred={isRegular(todo.name)}
                  sortable={false}
                />
              ))}
            </>
          )}

          <div ref={deleteZoneRef} className={`delete-zone ${isDragging ? 'visible' : ''} ${overDelete ? 'over' : ''}`}>
            <Trash2 size={24} />
          </div>
        </DndContext>
      )}
    </div>
  );
}
