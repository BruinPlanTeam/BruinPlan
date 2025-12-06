import { useCallback } from 'react';

const MAX_ROWS = 4;
const MAX_COLS = 4;

// custom hook for course validation logic - centralizes both the boolean prereq check and missing-prereq computation
export function useCourseValidation(
  droppableZones,
  completedClasses = new Set(),
  allClassesMap = {},
  categorizedClasses = {}
) {
  // build list of taken classes (completed classes + classes in zones before targetzoneid)
  const buildTakenClasses = useCallback((targetZoneId, currentId) => {
    let takenClasses = [];

    // include completed classes (quarter 0) in taken classes
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

    return takenClasses
      .flat()
      .filter(item => item !== currentId)
      .filter(Boolean)
      .map(item => String(item));
  }, [droppableZones, completedClasses]);

  // simple boolean: are all prerequisite groups satisfied?
  const arePrereqsCompleted = useCallback((targetZoneId, currentId, currentPrereqGroups = []) => {
    const takenClasses = buildTakenClasses(targetZoneId, currentId);

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
  }, [buildTakenClasses]);

  // detailed info: which prerequisite course codes are missing
  const getMissingPrereqs = useCallback(
    (targetZoneId, currentId, currentPrereqGroups = []) => {
      // if prereqs are satisfied, nothing is missing
      if (arePrereqsCompleted(targetZoneId, currentId, currentPrereqGroups)) {
        return [];
      }

      const takenClasses = buildTakenClasses(targetZoneId, currentId);

      const missingPrereqs = [];

      // missing prerequisites of the current class itself
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

          // look up prerequisite course by id in the master map first
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
    [arePrereqsCompleted, buildTakenClasses, allClassesMap, categorizedClasses],
  );

  // check if moving this course would violate any dependent courses (courses that need this one as a prereq)
  // if targetzoneid is null, check all dependents (for returning to sidebar)
  const getBlockingDependents = useCallback(
    (targetZoneId, currentId) => {
      if (currentId === null) {
        return [];
      }

      let targetQuarterNum = null;
      // if targetzoneid is null, we're returning to sidebar - check all dependents
      if (targetZoneId !== null) {
        for (let row = 1; row <= MAX_ROWS; row++) {
          for (let col = 1; col <= MAX_COLS; col++) {
            const zoneId = `zone-${row}-${col}`;
            if (zoneId === targetZoneId) {
              targetQuarterNum = (row - 1) * 4 + col;
              break;
            }
          }
          if (targetQuarterNum !== null) break;
        }
      }

      const blockingDependents = [];
      for (let row = 1; row <= MAX_ROWS; row++) {
        for (let col = 1; col <= MAX_COLS; col++) {
          const zoneId = `zone-${row}-${col}`;
          const zoneObj = droppableZones[zoneId];
          if (!zoneObj || !zoneObj.items) continue;

          const zoneQuarterNum = (row - 1) * 4 + col;

          for (const item of zoneObj.items) {
            if (String(item.id) === String(currentId)) continue;

            const futurePrereqGroups = Array.isArray(item.prereqGroups)
              ? item.prereqGroups
              : [];

            for (const group of futurePrereqGroups) {
              if (
                Array.isArray(group) &&
                group.some((prereqId) => String(prereqId) === String(currentId))
              ) {
                // this course depends on the dragged one
                // if targetzoneid is null (returning to sidebar), any dependent is a blocker
                // if targetzoneid is set, dependent is a blocker if it's in the same or an earlier quarter
                if (targetZoneId === null || (targetQuarterNum !== null && zoneQuarterNum <= targetQuarterNum)) {
                  const code =
                    item.code ||
                    (allClassesMap[String(item.id)] || {}).code;
                  if (code && !blockingDependents.includes(code)) {
                    blockingDependents.push(code);
                  }
                }
              }
            }
          }
        }
      }

      return blockingDependents;
    },
    [droppableZones, allClassesMap],
  );

  return {
    arePrereqsCompleted,
    getMissingPrereqs,
    getBlockingDependents,
  };
}

