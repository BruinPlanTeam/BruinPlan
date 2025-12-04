import { useState, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { getCurrentUnits } from '../utils/courseUtils';

const MAX_UNITS = 21;
const QUARTERS = {
  1: 'Fall',
  2: 'Winter',
  3: 'Spring',
  4: 'Summer'
};

/**
 * Custom hook for drag and drop functionality
 * Note: Pass validation function separately to avoid circular dependencies
 */
export function useDragAndDrop(
    categorizedClasses,
    addCourseToCategory,
    removeCourseFromCategories,
    requirementGroups,
    completedClasses = new Set(),
    allClassesMap = {}
) {
  // initialize droppable zones
  const [droppableZones, setDroppableZones] = useState(() => {
    const zones = {};
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 4; col++) {
        const zoneId = `zone-${row}-${col}`;
        zones[zoneId] = {
          id: zoneId,
          title: `${QUARTERS[col]}`,
          items: [],
        };
      }
    }
    return zones;
  });
  
  const [activeId, setActiveId] = useState(null);
  const [electricCourseId, setElectricCourseId] = useState(null);
  const [rejectedCourseInfo, setRejectedCourseInfo] = useState(null);

  /**
   * Trigger the electric border effect
   */
  const triggerElectricEffect = useCallback((courseId) => {
    setElectricCourseId(courseId);
    setTimeout(() => {
      setElectricCourseId(null);
    }, 1000);
  }, []);

  const getDependentCourses = useCallback((courseId) => {
    const dependents = [];
    Object.values(droppableZones).forEach(zone => {
      (zone.items || []).forEach(item => {
        const groups = Array.isArray(item.prereqGroups) ? item.prereqGroups : [];
        groups.forEach(group => {
          if (Array.isArray(group) && group.some(id => String(id) === String(courseId))) {
            dependents.push(allClassesMap[String(item.id)]?.code || item.code);
          }
        });
      });
    });
    return dependents;
  }, [droppableZones, allClassesMap]);

  /**
   * Reorder items within a zone
   */
  const reorderZone = useCallback((targetZoneId, event) => {
    setDroppableZones((zones) => {
      const zone = zones[targetZoneId];
      const activeIdNormalized = String(event.active.id);
      const overIdNormalized = String(event.over.id);
      const oldIndex = zone.items.findIndex((item) => String(item.id) === activeIdNormalized);
      const newIndex = zone.items.findIndex((item) => String(item.id) === overIdNormalized);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        return {
          ...zones,
          [targetZoneId]: {
            ...zone,
            items: arrayMove(zone.items, oldIndex, newIndex),
          },
        };
      }
      return zones;
    });
  }, []);

  /**
   * Move item from one zone to another
   */
  const moveFromZoneToZone = useCallback((sourceZoneId, targetZoneId, event) => {
    setDroppableZones((zones) => {
      const sourceZone = zones[sourceZoneId];
      const targetZone = zones[targetZoneId];
      const activeIdNormalized = String(event.active.id);
      const item = sourceZone.items.find((item) => String(item.id) === activeIdNormalized);

      if (item) {
        return {
          ...zones,
          [sourceZoneId]: {
            ...sourceZone,
            items: sourceZone.items.filter((i) => String(i.id) !== activeIdNormalized),
          },
          [targetZoneId]: {
            ...targetZone,
            items: [...targetZone.items, item],
          },
        };
      }
      return zones;
    });
  }, []);

  /**
   * Remove course from zone and add back to categories
   */
  const returnCourseToSidebar = useCallback((item, sourceZoneId) => {
    // Normalize item ID for consistent comparison
    const itemIdNormalized = String(item.id);
    
    // Try to find the original course object from the master list to preserve all properties
    const courseToAdd = allClassesMap[itemIdNormalized] || item;
    
    // remove from zone
    setDroppableZones((zones) => ({
      ...zones,
      [sourceZoneId]: {
        ...zones[sourceZoneId],
        items: zones[sourceZoneId].items.filter((i) => String(i.id) !== itemIdNormalized),
      },
    }));
    
    // add back to category - use requestAnimationFrame to ensure zone update is processed first
    requestAnimationFrame(() => {
      addCourseToCategory(courseToAdd, requirementGroups);
    });
  }, [addCourseToCategory, requirementGroups, allClassesMap]);

  /**
   * Move course from category sidebar to zone
   */
  const moveCourseToZone = useCallback((targetZoneId, item) => {
    // Normalize ID to string for consistent removal
    const courseId = String(item.id);
    
    // remove from categories
    removeCourseFromCategories(courseId);
    
    // add to zone
    setDroppableZones((zones) => ({
      ...zones,
      [targetZoneId]: {
        ...zones[targetZoneId],
        items: [...zones[targetZoneId].items, item],
      },
    }));
  }, [removeCourseFromCategories]);

  /**
   * Handle drag start event
   */
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
    // could add hover effects here if needed
  }, []);

  /**
   * Handle drag end event
   * Note: This returns a function that needs validation injected
   */
  const createHandleDragEnd = useCallback((arePrereqsCompleted, getMissingPrereqs) => (event) => {
    const { active, over } = event;
    let currentName = null;
    let currentId = null;
    let currentUnits = null;
    let currentPrereqGroups = null;

    // if the item is still being dragged don't assign it to a box
    if (!over) {
      setActiveId(null);
      return;
    }

          

    const getPrereqGroups = (item) => {
      if (!item || !Array.isArray(item.prereqGroups)) return [];
      return item.prereqGroups.filter(group => Array.isArray(group) && group.length > 0);
    };

    // Normalize active ID for consistent comparison
    const activeIdNormalized = String(active.id);

    // get the id of where the object came from
    let sourceZoneId = null;
    for (const [key, zone] of Object.entries(droppableZones)) {
      const matchedItem = zone.items.find((item) => String(item.id) === activeIdNormalized);
      if (matchedItem) {
        currentName = matchedItem.code;
        currentId = matchedItem.id;
        currentUnits = matchedItem.units;
        currentPrereqGroups = getPrereqGroups(matchedItem);
        sourceZoneId = key;
        break;
      }
    }

    // check if the current item is in any of the categorized lists
    let isInDraggableList = false;
    let foundItem = null;

    for (const [category, courseList] of Object.entries(categorizedClasses)) {
      const item = courseList.find((course) => String(course.id) === activeIdNormalized);
      if (item) {
        isInDraggableList = true;
        foundItem = item;
        currentName = item.code;
        currentId = item.id;
        currentUnits = item.units;
        currentPrereqGroups = getPrereqGroups(item);
        break;
      }
    }

    // check if the current item is over a droppable zone
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    );

    // check if the current item is over any category zone
    const isDroppedOnCategoryZone = over.id && over.id.startsWith('category-');

    // Normalize over ID for consistent comparison
    const overIdNormalized = String(over.id);

    // find draggable item that current draggable item is hovering over
    let targetItem = null;
    for (const courseList of Object.values(categorizedClasses)) {
      const item = courseList.find((course) => String(course.id) === overIdNormalized);
      if (item) {
        targetItem = item;
        break;
      }
    }

    // if not dropped directly on a zone, check if dropped on an item inside a zone
    if (!targetZoneId && !isDroppedOnCategoryZone && !targetItem) {
      for (const [key, zone] of Object.entries(droppableZones)) {
        if (zone.items.some((item) => String(item.id) === overIdNormalized)) {
          targetZoneId = key;
          break;
        }
      }
    }

    // handle dropping on an item in the sidebar
    if (targetItem || (isDroppedOnCategoryZone && sourceZoneId)) {
      if (sourceZoneId && currentId != null) {
        const item = droppableZones[sourceZoneId].items.find((it) => String(it.id) === activeIdNormalized);
        if (item) {
          const dependents = getDependentCourses(item.id);
          if (dependents.length > 0) {
            setRejectedCourseInfo({
              courseCode: currentName,
              reason: 'dependents',
              dependents,
            });
          } else {
            returnCourseToSidebar(item, sourceZoneId);
          }
        }
      }
    } 
    // handle dropping on a quarter zone
    else if (targetZoneId) {
      const targetZone = droppableZones[targetZoneId];
      const isHoveringOverItemInZone = targetZone.items.some(
        (item) => String(item.id) === overIdNormalized,
      );

      const filteredPrereqGroups = (currentPrereqGroups || [])
        .map((group) => group.filter((prereq) => String(prereq) !== String(currentId)))
        .filter((group) => group.length > 0);

      const totalUnits = getCurrentUnits(targetZoneId, droppableZones) + currentUnits;
      const prereqsCompleted = arePrereqsCompleted(
        targetZoneId,
        currentId,
        filteredPrereqGroups,
      );

      // Re-check dependent courses every time: any course that has currentId in its prereqGroups
      // must be scheduled strictly AFTER the target quarter
      const blockingDependents = new Set();
      let targetQuarterNum = null;
      // compute target quarter number
      for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 4; col++) {
          const zone = `zone-${row}-${col}`;
          if (zone === targetZoneId) {
            targetQuarterNum = (row - 1) * 4 + col;
            break;
          }
        }
        if (targetQuarterNum !== null) break;
      }

      if (currentId != null && targetQuarterNum != null) {
        for (let row = 1; row <= 4; row++) {
          for (let col = 1; col <= 4; col++) {
            const zoneId = `zone-${row}-${col}`;
            const zone = droppableZones[zoneId];
            if (!zone || !zone.items) continue;

            const zoneQuarterNum = (row - 1) * 4 + col;

            for (const item of zone.items) {
              if (!Array.isArray(item.prereqGroups) || item.prereqGroups.length === 0) continue;
              const isDependent = item.prereqGroups.some((group) =>
                Array.isArray(group) && group.some((id) => String(id) === String(currentId)),
              );

              if (isDependent && zoneQuarterNum <= targetQuarterNum) {
                // This course depends on the dragged one but is not strictly after it
                blockingDependents.add(item.code);
              }
            }
          }
        }
      }

      const hasBlockingDependents = blockingDependents.size > 0;

      const buildMissingPrereqsPayload = () => {
        const missingFromPrereqs = getMissingPrereqs(
          targetZoneId,
          currentId,
          filteredPrereqGroups,
        );
        return [...missingFromPrereqs];
      };

      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // reordering within the same zone
        reorderZone(targetZoneId, event);
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // moving from one zone to another
        if (totalUnits > MAX_UNITS) {
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'units',
            message: `This quarter already has ${getCurrentUnits(
              targetZoneId,
              droppableZones,
            )} units. Maximum is ${MAX_UNITS} units.`,
          });
        } else if (!prereqsCompleted) {
          const missingPrereqs = buildMissingPrereqsPayload();
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'prereqs',
            missingPrereqs,
          });
        } else if (hasBlockingDependents) {
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'dependents',
            dependents: Array.from(blockingDependents),
          });
        } else {
          moveFromZoneToZone(sourceZoneId, targetZoneId, event);
          triggerElectricEffect(currentId);
        }
      } else if (isInDraggableList && foundItem) {
        // moving from category list to zone
        if (totalUnits > MAX_UNITS) {
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'units',
            message: `This quarter already has ${getCurrentUnits(
              targetZoneId,
              droppableZones,
            )} units. Maximum is ${MAX_UNITS} units.`,
          });
        } else if (!prereqsCompleted) {
          const missingPrereqs = buildMissingPrereqsPayload();
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'prereqs',
            missingPrereqs,
          });
        } else if (hasBlockingDependents) {
          setRejectedCourseInfo({
            courseCode: currentName,
            reason: 'dependents',
            dependents: Array.from(blockingDependents),
          });
        } else {
          moveCourseToZone(targetZoneId, foundItem);
          triggerElectricEffect(currentId);
        }
      }
    }

    setActiveId(null);
  }, [
    droppableZones,
    categorizedClasses,
    reorderZone,
    moveFromZoneToZone,
    returnCourseToSidebar,
    moveCourseToZone,
    triggerElectricEffect
  ]);

  // find active item from either category lists or zones
  const activeItem = activeId
    ? Object.values(categorizedClasses)
        .flat()
        .find((item) => String(item.id) === String(activeId)) ||
      Object.values(droppableZones)
        .flatMap((zone) => zone.items)
        .find((item) => String(item.id) === String(activeId))
    : null;

  return {
    droppableZones,
    setDroppableZones,
    activeId,
    activeItem,
    electricCourseId,
    rejectedCourseInfo,
    setRejectedCourseInfo,
    handleDragStart,
    handleDragOver,
    createHandleDragEnd,
  };
}

