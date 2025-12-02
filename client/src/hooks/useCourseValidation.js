import { useCallback } from 'react';

const MAX_ROWS = 4;
const MAX_COLS = 4;

/**
 * Custom hook for course validation logic (prerequisites, units, etc.)
 */
export function useCourseValidation(droppableZones) {
  const arePrereqsCompleted = useCallback((targetZoneId, currentId, currentPrereqGroups = []) => {
    let takenClasses = [];

    outerLoop: for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        if (zone === targetZoneId) break outerLoop;
        
        const zoneObj = droppableZones[zone];
        if (zoneObj && zoneObj.items) {
        const classesInZone = zoneObj.items.flatMap(item => item.id);
        takenClasses.push(classesInZone);
      }
    }
    }

    takenClasses = takenClasses
      .flat()
      .filter(item => item != currentId)
      .filter(Boolean)
      .map(item => String(item));

    if (!Array.isArray(currentPrereqGroups) || currentPrereqGroups.length === 0) {
      return true;
    }

    let allGroupsSatisfied = true;
    for (const group of currentPrereqGroups) {
      if (!Array.isArray(group) || group.length === 0) continue;

      let groupSatisfied = false;
      for (const prereqId of group) {
        const prereqIdStr = String(prereqId);
        const found = takenClasses.some(item => String(item) === prereqIdStr);
        if (found) {
          groupSatisfied = true;
          break;
      }
    }

      if (!groupSatisfied) {
        allGroupsSatisfied = false;
        break;
      }
    }

    if (!allGroupsSatisfied) {
      return false;
    }

    let foundTarget = false;
    for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        
        if (zone === targetZoneId) {
          foundTarget = true;
        }
        
        if (foundTarget) {
          const zoneObj = droppableZones[zone];
          if (zoneObj && zoneObj.items) {
          for (const classItem of zoneObj.items) {
            if (classItem.id == currentId) continue;
            
              const futurePrereqGroups = Array.isArray(classItem.prereqGroups)
                ? classItem.prereqGroups
                : [];

              for (const group of futurePrereqGroups) {
                if (Array.isArray(group) && group.some(prereqId => String(prereqId) === String(currentId))) {
              return false;
                }
              }
            }
          }
        }
      }
    }
  
    return true;
  }, [droppableZones]);

  return {
    arePrereqsCompleted
  };
}

