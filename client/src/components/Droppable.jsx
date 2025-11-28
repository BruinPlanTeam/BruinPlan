import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Draggable } from './Draggable'
import ElectricBorder from './ElectricBorder'
import '../DegreePlan.css'

const MAX_UNITS = 21;
const MIN_UNITS = 12;

export function Droppable({ id, title, items, units, maxUnits, showElectric }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  // Handle undefined or null items
  const safeItems = items || [];
  
  // Calculate total units for this zone
  const totalUnits = units !== undefined ? units : safeItems.reduce((sum, item) => sum + (item.units || 0), 0);
  const isSidebar = id === 'original-column';
  
  // Determine status classes
  const getStatusClass = () => {
    if (isSidebar) return 'sidebar-zone';
    if (totalUnits > (maxUnits || MAX_UNITS)) return 'zone-error';
    if (totalUnits > 0 && totalUnits < MIN_UNITS && !title.includes('Summer')) return 'zone-warning';
    if (totalUnits > 0) return 'zone-good';
    return '';
  };

  const getUnitStatusClass = () => {
    if (isSidebar) return '';
    if (totalUnits > (maxUnits || MAX_UNITS)) return 'units-error';
    if (totalUnits > 0 && totalUnits < MIN_UNITS && !title.includes('Summer')) return 'units-warning';
    return 'units-normal';
  };

  const zoneContent = (
    <div
      id={id}
      ref={setNodeRef}
      className={`droppable-zone ${getStatusClass()} ${isOver ? 'drag-over' : ''}`}
    >
      <div className="zone-header">
        <div className="zone-title">{title}</div>
        {!isSidebar && (
          <div className={`zone-units ${getUnitStatusClass()}`}>
            {totalUnits}/{maxUnits || MAX_UNITS}
          </div>
        )}
      </div>

      <div className="zone-content">
        <SortableContext
          items={safeItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {safeItems.map((item) => (
            <Draggable key={item.id} id={item.id} item={item} />
          ))}
        </SortableContext>

        {!isSidebar && safeItems.length === 0 && (
          <div className="zone-empty">
            Drop courses here
          </div>
        )}
      </div>
    </div>
  );

  // Wrap with ElectricBorder if showElectric is true and not sidebar
  if (showElectric && !isSidebar) {
    return (
      <ElectricBorder 
        color="#64ffda" 
        speed={1.5} 
        chaos={0.5} 
        thickness={2}
        style={{ borderRadius: 12 }}
      >
        {zoneContent}
      </ElectricBorder>
    );
  }

  return zoneContent;
}
