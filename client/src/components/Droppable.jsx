import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { Draggable } from './Draggable'
import '../DegreePlan.css'

export function Droppable({ id, title, items }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <div
      id={id}
      ref={setNodeRef}
      className={`droppable-zone ${isOver ? 'drag-over' : ''}`}
    >
      <h3>{title}</h3>
      <SortableContext items={items.map((item) => item.id)}>
        <div className="dropped-items">
          {items.map((item) => (
            <Draggable key={item.id} id={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
