import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, children, title }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  
  return (
    <div ref={setNodeRef}>
      <h3>{title || id}</h3>
      {children}
    </div>
  );
}
