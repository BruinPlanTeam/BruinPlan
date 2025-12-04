import { useCallback } from 'react';

const MAX_ROWS = 4;
const MAX_COLS = 4;

/**
 * Custom hook for course validation logic (prerequisites, units, etc.)
 * Centralizes both the boolean prereq check and missing-prereq computation.
 */
export function useCourseValidation(
  droppableZones,
  completedClasses = new Set(),
  allClassesMap = {},
  categorizedClasses = {}
) {
  // Simple boolean: are all prerequisite groups satisfied?
  const arePrereqsCompleted = useCallback((targetZoneId, currentId, currentPrereqGroups = []) => {
    let takenClasses = [];

    // Include completed classes (quarter 0) in taken classes
    if (completedClasses && completedClasses.size > 0) {
      takenClasses.push(...Array.from(completedClasses).map(id => String(id)));
    }

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

    let allGroupsSatisfied = true;

    if (Array.isArray(currentPrereqGroups) && currentPrereqGroups.length > 0) {
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
    }

    return allGroupsSatisfied;
  }, [droppableZones, completedClasses]);

  // Detailed info: which prerequisite course codes are missing?
  const getMissingPrereqs = useCallback(
    (targetZoneId, currentId, currentPrereqGroups = []) => {
      // if prereqs are satisfied and there is no dependent violation, nothing is missing
      if (arePrereqsCompleted(targetZoneId, currentId, currentPrereqGroups)) {
        return [];
      }

      let takenClasses = [];

      if (completedClasses && completedClasses.size > 0) {
        takenClasses.push(...Array.from(completedClasses).map((id) => String(id)));
      }

      outerLoop: for (let row = 1; row <= MAX_ROWS; row++) {
        for (let col = 1; col <= MAX_COLS; col++) {
          const zone = `zone-${row}-${col}`;
          if (zone === targetZoneId) break outerLoop;

          const zoneObj = droppableZones[zone];
          if (zoneObj && zoneObj.items) {
            const classesInZone = zoneObj.items.flatMap((item) => item.id);
            takenClasses.push(classesInZone);
          }
        }
      }

      takenClasses = takenClasses
        .flat()
        .filter((item) => item != currentId)
        .filter(Boolean)
        .map((item) => String(item));

      const missingPrereqs = [];

      // 1) Missing prerequisites of the current class itself
      for (const group of currentPrereqGroups || []) {
        if (!Array.isArray(group) || group.length === 0) continue;

        let groupSatisfied = false;
        const missingInGroup = [];

        for (const prereqId of group) {
          const prereqIdStr = String(prereqId);
          if (takenClasses.includes(prereqIdStr)) {
            groupSatisfied = true;
            break;
          }

          // Look up prerequisite course by id in the master map first
          const course =
            allClassesMap[prereqIdStr] ||
            Object.values(categorizedClasses)
              .flat()
              .find((c) => String(c.id) === prereqIdStr);

          if (course) {
            missingInGroup.push(course.code);
          }
        }

        if (!groupSatisfied && missingInGroup.length > 0) {
          missingPrereqs.push(missingInGroup);
        }
      }

      return missingPrereqs;
    },
    [arePrereqsCompleted, droppableZones, completedClasses, allClassesMap, categorizedClasses],
  );

  return {
    arePrereqsCompleted,
    getMissingPrereqs,
  };
}

