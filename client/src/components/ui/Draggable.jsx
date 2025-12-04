import React, { useState } from 'react'
import { useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ElectricBorder from './ElectricBorder'
import '../../styles/DegreePlan.css'

export function Draggable({ id, item, showElectric, requirementGroups = [] }) {
  const [showTooltip, setShowTooltip] = useState(false);
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

  // get requirements this course fulfills
  const getFulfilledRequirements = () => {
    if (!item.fulfillsReqIds || !Array.isArray(item.fulfillsReqIds) || item.fulfillsReqIds.length === 0) {
      return [];
    }
    
    const fulfilledReqs = [];
    requirementGroups.forEach(group => {
      (group.requirements || []).forEach(req => {
        if (item.fulfillsReqIds.includes(req.id)) {
          fulfilledReqs.push({
            groupName: group.name,
            reqName: req.name
          });
        }
      });
    });
    return fulfilledReqs;
  };

  const fulfilledReqs = getFulfilledRequirements();

  const courseCard = (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-item"
      onMouseEnter={(e) => {
        if (!isDragging) {
          setShowTooltip(true);
        }
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="course-header">
        <span className="course-code">{item.code}</span>
        <span className="course-units">{item.units}</span>
      </div>
      {item.description && (
        <div className="course-description">{item.description}</div>
      )}
      {showTooltip && fulfilledReqs.length > 0 && (
        <div className="course-requirements-tooltip" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          <div className="tooltip-title">Fulfills Requirements:</div>
          {fulfilledReqs.map((req, idx) => (
            <div key={idx} className="tooltip-requirement">
              <span className="tooltip-group">{req.groupName}</span>
              <span className="tooltip-separator">•</span>
              <span className="tooltip-req">{req.reqName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );


  // wrap with ElectricBorder if showElectric is true
  if (showElectric) {
    return (
      <ElectricBorder 
        color="#2774AE" 
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