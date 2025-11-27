import { useCallback } from 'react';

const MAX_ROWS = 4;
const MAX_COLS = 4;

/**
 * Custom hook for course validation logic (prerequisites, units, etc.)
 */
export function useCourseValidation(droppableZones) {
  /**
   * Check if prerequisites are completed for a course being moved to a target zone
   * @param {string} targetZoneId - The zone where the course is being dropped
   * @param {string} currentId - The ID of the course being moved
   * @param {Array} currentPrereqs - Array of prerequisite IDs
   * @returns {boolean} True if all prerequisites are satisfied
   */
  const arePrereqsCompleted = useCallback((targetZoneId, currentId, currentPrereqs) => {
    let takenClasses = [];
    let unsatisfiedPrereqs = [];

    // Collect all classes that have been taken BEFORE the target zone
    outerLoop: for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        // Break BEFORE adding classes from target zone
        if (zone === targetZoneId) break outerLoop;
        
        const zoneObj = droppableZones[zone];
        const classesInZone = zoneObj.items.flatMap(item => item.id);
        takenClasses.push(classesInZone);
      }
    }

    // Flatten and remove currentId from taken classes
    takenClasses = takenClasses.flat().filter(item => item != currentId).filter(Boolean);
    
    // Check if all prerequisites are satisfied
    for (const prereq of currentPrereqs) {
      // Use loose equality to handle string/number type mismatches
      if (!takenClasses.find(item => item == prereq)) {
        unsatisfiedPrereqs.push(prereq);
      }
    }

    if (unsatisfiedPrereqs.length > 0) {
      console.log("Unsatisfied prerequisites:", unsatisfiedPrereqs);
      return false;
    }

    // Check if this class is a prerequisite for any class in or after the target zone
    let foundTarget = false;
    for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col++) {
        const zone = `zone-${row}-${col}`;
        
        // Mark when we've reached the target zone
        if (zone === targetZoneId) {
          foundTarget = true;
        }
        
        // Check all zones at or after the target
        if (foundTarget) {
          const zoneObj = droppableZones[zone];
          for (const classItem of zoneObj.items) {
            // Skip checking the current class against itself
            if (classItem.id == currentId) continue;
            
            // Check if currentId is a prerequisite for this class
            if (classItem.prereqIds && classItem.prereqIds.some(prereqId => prereqId == currentId)) {
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

