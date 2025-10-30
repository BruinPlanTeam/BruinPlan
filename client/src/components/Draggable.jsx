import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function Draggable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <button 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="p-3 bg-white border border-gray-300 rounded-lg shadow-sm touch-none cursor-grab active:cursor-grabbing z-10"
    >
      {children}
    </button>
  );
}