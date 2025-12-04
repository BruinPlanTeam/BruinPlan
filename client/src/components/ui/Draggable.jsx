import React, { useState } from 'react'
import { useSortable} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ElectricBorder from './ElectricBorder'
import { getRequirementDisplayName } from '../../utils/requirementUtils'
import '../../styles/DegreePlan.css'

export function Draggable({ id, item, showElectric, requirementGroups = [], contextCategory = null, allClassesMap = {} }) {
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

    // Helper: pick a single "best" requirement, preferring Core/Prep-style labels
    const pickSinglePreferred = (list) => {
      if (!list || list.length === 0) return [];
      const preferred = list.find((req) => {
        const name = req.displayName.toLowerCase();
        return name.includes('core') || name.includes('prep');
      });
      return [preferred || list[0]];
    };

    if (contextCategory) {
      const lowerCat = contextCategory.toLowerCase();

      const matchesForCategory = (req) => {
        const combo = `${req.groupName} ${req.reqName}`.toLowerCase();
        if (lowerCat === 'prep') return combo.includes('prep');
        if (lowerCat === 'major') return combo.includes('major');
        if (lowerCat.includes('tech') || lowerCat.includes('breadth')) {
          return combo.includes('tbr') || combo.includes('tech breadth');
        }
        if (lowerCat.includes('sci-tech') || lowerCat.includes('sci')) {
          return (
            combo.includes('sci-tech') ||
            combo.includes('sci tech') ||
            (combo.includes('science') && combo.includes('technology'))
          );
        }
        if (lowerCat.includes('ge')) {
          return combo.includes('ge') || combo.includes('general education');
        }
        return false;
      };

      const filtered = allReqs.filter(matchesForCategory);

      // Prep / Major: **exactly one** requirement
      if (lowerCat === 'prep' || lowerCat === 'major') {
        if (filtered.length > 0) return pickSinglePreferred(filtered);
        return pickSinglePreferred(allReqs);
      }

      // Sci‑Tech / Tech Breadth / GE: show **all** matches (or allReqs if none matched)
      if (filtered.length > 0) return filtered;
      return allReqs;
    }

    // Grid cells (no context):
    // - If this class has any "Core"/"Prep" style requirement, show ONE of those
    // - Otherwise (GE / Sci-Tech / TBR), show all deduped requirements
    const coreOrPrepReqs = allReqs.filter((req) => {
      const name = req.displayName.toLowerCase();
      return name.includes('core') || name.includes('prep');
    });

    if (coreOrPrepReqs.length > 0) {
      return pickSinglePreferred(coreOrPrepReqs);
    }

    return allReqs;
  };

  const fulfilledReqs = getFulfilledRequirements();

  const getPrereqGroupsWithCodes = () => {
    const groups = Array.isArray(item.prereqGroups) ? item.prereqGroups : [];
    return groups
      .map(group => {
        if (!Array.isArray(group) || group.length === 0) return null;
        const codes = group
          .map(id => {
            const course = allClassesMap[String(id)];
            return course?.code;
          })
          .filter(Boolean);
        return codes.length ? codes : null;
      })
      .filter(Boolean);
  };

  const prereqGroups = getPrereqGroupsWithCodes();

  const handleMouseEnter = () => {
    if (isDragging) return;
    setShowTooltip(true);
  };

  const courseCard = (
    <div
      ref={setNodeRef}
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
      {showTooltip && (fulfilledReqs.length > 0 || prereqGroups.length > 0) && (
        <div
          className="course-requirements-tooltip"
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
          {prereqGroups.length > 0 && (
            <div className="tooltip-prereqs">
              <span className="tooltip-prereqs-label">Prereqs:</span>
              <span className="tooltip-prereqs-codes">
                {prereqGroups.map(group => group.join(' OR ')).join(' OR ')}
              </span>
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