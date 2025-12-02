import { useCallback } from 'react';

const MAX_ROWS = 4;
const MAX_COLS = 4;

/**
 * Custom hook for course validation logic (prerequisites, units, etc.)
 */
export function useCourseValidation(droppableZones) {
  // Check if prerequisites are completed for a course being moved to a target zone.
  // currentPrereqs is an array of prerequisite IDs (already normalized).
  const arePrereqsCompleted = useCallback((targetZoneId, currentId, currentPrereqs = []) => {
    let takenClasses = [];
    let unsatisfiedPrereqs = [];

    // collect all classes that have been taken before the target zone
    outerLoop: for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        // break before adding classes from target zone
        if (zone === targetZoneId) break outerLoop;
        
        const zoneObj = droppableZones[zone];
        const classesInZone = zoneObj.items.flatMap(item => item.id);
        takenClasses.push(classesInZone);
      }
    }

    // flatten and remove currentId from taken classes
    takenClasses = takenClasses.flat().filter(item => item != currentId).filter(Boolean);
    
    // check if all prerequisites are satisfied (AND over the normalized prereq list)
    if (Array.isArray(currentPrereqs)) {
      for (const prereq of currentPrereqs) {
        // use loose equality to handle string/number type mismatches
        if (!takenClasses.find(item => item == prereq)) {
          unsatisfiedPrereqs.push(prereq);
        }
      }
    }

    if (unsatisfiedPrereqs.length > 0) {
      console.log("Unsatisfied prerequisites:", unsatisfiedPrereqs);
      return false;
    }

    // check if this class is a prerequisite for any class in or after the target zone
    let foundTarget = false;
    for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        
        // mark when we've reached the target zone
        if (zone === targetZoneId) {
          foundTarget = true;
        }
        
        // check all zones at or after the target
        if (foundTarget) {
          const zoneObj = droppableZones[zone];
          for (const classItem of zoneObj.items) {
            // skip checking the current class against itself
            if (classItem.id == currentId) continue;
            
            // normalize prereqs for classes already on the board
            const futurePrereqs = Array.isArray(classItem.prereqGroups)
              ? classItem.prereqGroups.flat().filter(Boolean)
              : [];

            // check if currentId is a prerequisite for this class
            if (futurePrereqs.some(prereqId => prereqId == currentId)) {
              console.log(`Cannot move: This class is a prerequisite for ${classItem.code} in ${zone}`);
              return false;
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

