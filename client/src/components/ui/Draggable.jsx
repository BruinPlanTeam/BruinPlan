import React, { useState } from 'react'
import { useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ElectricBorder from './ElectricBorder'
import '../../styles/DegreePlan.css'

export function Draggable({ id, item, showElectric }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const courseCard = (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-item"
    >
      <div className="course-header">
        <span className="course-code">{item.code}</span>
        <span className="course-units">{item.units}</span>
      </div>
      {item.description && (
        <div className="course-description">{item.description}</div>
      )}
    </div>
  );


  // Wrap with ElectricBorder if showElectric is true
  if (showElectric) {
    return (
      <ElectricBorder 
        color="#64ffda" 
        speed={1.5} 
        chaos={0.5} 
        thickness={2}
        style={{ borderRadius: 8 }}
      >
        {courseCard}
      </ElectricBorder>
    );
  }




  
  return courseCard;
}