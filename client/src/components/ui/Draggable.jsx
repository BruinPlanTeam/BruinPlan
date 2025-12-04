import React, { useState, useRef } from 'react'
import { useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ElectricBorder from './ElectricBorder'
import { getRequirementDisplayName } from '../../utils/requirementUtils'
import '../../styles/DegreePlan.css'

export function Draggable({ id, item, showElectric, requirementGroups = [], contextCategory = null, allClassesMap = {} }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const cardRef = useRef(null);
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

  // normalize requirement into a broad bucket based on its text
  const categorizeReq = (groupName, reqName) => {
    const combo = `${groupName} ${reqName}`.toLowerCase();
    if (combo.includes('prep')) return 'prep';
    if (combo.includes('major')) return 'major';
    if (combo.includes('tbr') || combo.includes('tech breadth')) return 'tech-breadth';
    if (combo.includes('sci-tech') || combo.includes('sci tech') || (combo.includes('science') && combo.includes('technology'))) {
      return 'sci-tech';
    }
    if (combo.includes('ge') || combo.includes('general education')) return 'ge';
    return 'other';
  };

  // get requirements this course fulfills
  const getFulfilledRequirements = () => {
    if (!item.fulfillsReqIds || !Array.isArray(item.fulfillsReqIds) || item.fulfillsReqIds.length === 0) {
      return [];
    }
    
    const dedupMap = new Map();
    const bucketMap = new Map(); // one entry per bucket (prep / major / TB / etc.)
    requirementGroups.forEach(group => {
      (group.requirements || []).forEach(req => {
        if (item.fulfillsReqIds.includes(req.id)) {
          const key = `${group.name}|${req.name}`;
          if (!dedupMap.has(key)) {
            const entry = {
              groupName: group.name,
              reqName: req.name,
              displayName: getRequirementDisplayName(req.name),
            };
            dedupMap.set(key, entry);

            const bucket = categorizeReq(group.name, req.name);
            if (!bucketMap.has(bucket)) {
              bucketMap.set(bucket, entry);
            }
          }
        }
      });
    });
    
    let allReqs = Array.from(dedupMap.values());

    // Deduplicate by displayName so we don't show "Core" twice, etc.
    const seenNames = new Set();
    allReqs = allReqs.filter(req => {
      const key = req.displayName.toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });

    // If we know the context (sidebar category), show just ONE matching requirement
    if (contextCategory) {
      const lowerCat = contextCategory.toLowerCase();
      const filtered = allReqs.filter(req => {
        const combo = `${req.groupName} ${req.reqName}`.toLowerCase();
        if (lowerCat === 'prep') {
          return combo.includes('prep');
        }
        if (lowerCat === 'major') {
          return combo.includes('major');
        }
        if (lowerCat.includes('tech') || lowerCat.includes('breadth')) {
          return combo.includes('tbr') || combo.includes('tech breadth');
        }
        if (lowerCat.includes('sci-tech') || lowerCat.includes('sci')) {
          return combo.includes('sci-tech') || combo.includes('sci tech') || (combo.includes('science') && combo.includes('technology'));
        }
        return true;
      });
      return filtered.length ? [filtered[0]] : [];
    }

    // For grid cells (no explicit context), pick a single representative bucket
    const priority = ['prep', 'major', 'tech-breadth', 'sci-tech', 'ge', 'other'];
    for (const bucket of priority) {
      if (bucketMap.has(bucket)) {
        return [bucketMap.get(bucket)];
      }
    }

    return [];
  };

  const fulfilledReqs = getFulfilledRequirements();

  const getPrereqCodes = () => {
    const groups = Array.isArray(item.prereqGroups) ? item.prereqGroups : [];
    const ids = new Set();
    groups.forEach(group => {
      if (Array.isArray(group)) {
        group.forEach(id => ids.add(String(id)));
      }
    });
    const codes = [];
    ids.forEach(id => {
      const course = allClassesMap[String(id)];
      if (course && course.code) {
        codes.push(course.code);
      }
    });
    return codes;
  };

  const prereqCodes = getPrereqCodes();

  const handleMouseEnter = () => {
    if (isDragging) return;
    if (contextCategory && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: 'fixed',
        top: rect.top + rect.height / 2,
        left: rect.left - 12,
        transform: 'translate(-100%, -50%)',
        pointerEvents: 'auto'
      });
    } else {
      setTooltipStyle(null);
    }
    setShowTooltip(true);
  };

  const courseCard = (
    <div
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      {...attributes}
      {...listeners}
      className="draggable-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="course-header">
        <span className="course-code">{item.code}</span>
        <span className="course-units">{item.units}</span>
      </div>
      {item.description && (
        <div className="course-description">{item.description}</div>
      )}
      {showTooltip && (fulfilledReqs.length > 0 || prereqCodes.length > 0) && (
        <div
          className={`course-requirements-tooltip ${contextCategory ? 'course-requirements-tooltip--side' : ''}`}
          style={tooltipStyle || undefined}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {fulfilledReqs.length > 0 && (
            <>
              <div className="tooltip-title">Fulfills Requirements:</div>
              {fulfilledReqs.map((req, idx) => (
                <div key={idx} className="tooltip-requirement">
                  <span className="tooltip-req">{req.displayName}</span>
                </div>
              ))}
            </>
          )}
          {prereqCodes.length > 0 && (
            <div className="tooltip-prereqs">
              <span className="tooltip-prereqs-label">Prereqs:</span>
              <span className="tooltip-prereqs-codes">{prereqCodes.join(', ')}</span>
            </div>
          )}
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