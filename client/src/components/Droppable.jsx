import { useDroppable } from '@dnd-kit/core';

export function Droppable({ id, children, title }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  
  const style = `
    min-h-[100px] 
    w-full 
    md:w-1/3 
    p-4 
    border-2 
    border-dashed 
    rounded-lg 
    flex 
    flex-col 
    items-center 
    gap-2
    transition-colors
    ${isOver ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-300'}
  `;

  return (
    <div ref={setNodeRef} className={style}>
      <h3 className="font-semibold text-gray-500">{title || id}</h3>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
