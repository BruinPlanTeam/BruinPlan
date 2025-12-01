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
    requirements,
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

  /**
   * Trigger the electric border effect
   */
  const triggerElectricEffect = useCallback((courseId) => {
    setElectricCourseId(courseId);
    setTimeout(() => {
      setElectricCourseId(null);
      console.log(`[ELECTRIC EFFECT] Resetting ID.`);
    }, 1000);
  }, []);

  /**
   * Reorder items within a zone
   */
  const reorderZone = useCallback((targetZoneId, event) => {
    setDroppableZones((zones) => {
      const zone = zones[targetZoneId];
      const oldIndex = zone.items.findIndex((item) => item.id === event.active.id);
      const newIndex = zone.items.findIndex((item) => item.id === event.over.id);
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
      const item = sourceZone.items.find((item) => item.id === event.active.id);

      if (item) {
        return {
          ...zones,
          [sourceZoneId]: {
            ...sourceZone,
            items: sourceZone.items.filter((i) => i.id !== event.active.id),
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
    // remove from zone
    setDroppableZones((zones) => ({
      ...zones,
      [sourceZoneId]: {
        ...zones[sourceZoneId],
        items: zones[sourceZoneId].items.filter((i) => i.id !== item.id),
      },
    }));
    
    // add back to category
    addCourseToCategory(item, requirements);
  }, [addCourseToCategory, requirements]);

  /**
   * Move course from category sidebar to zone
   */
  const moveCourseToZone = useCallback((targetZoneId, item) => {
    // remove from categories
    removeCourseFromCategories(item.id);
    
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
  const createHandleDragEnd = useCallback((arePrereqsCompleted) => (event) => {
    const { active, over } = event;
    let currentName = null;
    let currentId = null;
    let currentUnits = null;
    let currentPrereqs = null;

    // if the item is still being dragged don't assign it to a box
    if (!over) {
      setActiveId(null);
      return;
    }

          

    // get the id of where the object came from
    let sourceZoneId = null;
    for (const [key, zone] of Object.entries(droppableZones)) {
      const matchedItem = zone.items.find((item) => item.id === active.id);
      if (matchedItem) {
        currentName = matchedItem.code;
        currentId = matchedItem.id;
        currentUnits = matchedItem.units;
        currentPrereqs = matchedItem.prereqIds;
        sourceZoneId = key;
        break;
      }
    }

    // check if the current item is in any of the categorized lists
    let isInDraggableList = false;
    let foundItem = null;

    for (const [category, courseList] of Object.entries(categorizedClasses)) {
      const item = courseList.find((course) => course.id === active.id);
      if (item) {
        isInDraggableList = true;
        foundItem = item;
        currentName = item.code;
        currentId = item.id;
        currentUnits = item.units;
        currentPrereqs = item.prereqIds;
        break;
      }
    }

    // check if the current item is over a droppable zone
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    );

    // check if the current item is over any category zone
    const isDroppedOnCategoryZone = over.id && over.id.startsWith('category-');

    // find draggable item that current draggable item is hovering over
    let targetItem = null;
    for (const courseList of Object.values(categorizedClasses)) {
      const item = courseList.find((course) => course.id === over.id);
      if (item) {
        targetItem = item;
        break;
      }
    }

    // if not dropped directly on a zone, check if dropped on an item inside a zone
    if (!targetZoneId && !isDroppedOnCategoryZone && !targetItem) {
      for (const [key, zone] of Object.entries(droppableZones)) {
        if (zone.items.some((item) => item.id === over.id)) {
          targetZoneId = key;
          break;
        }
      }
    }

    // handle dropping on an item in the sidebar
    if (targetItem) {
      if (sourceZoneId) {
        const item = droppableZones[sourceZoneId].items.find((item) => item.id === active.id);
        if (item) {
          returnCourseToSidebar(item, sourceZoneId);
        }
      }
    } 
    // handle dropping on a category zone
    else if (isDroppedOnCategoryZone && sourceZoneId) {
      const item = droppableZones[sourceZoneId].items.find((item) => item.id === active.id);
      if (item) {
        returnCourseToSidebar(item, sourceZoneId);
      }
    } 
    // handle dropping on a quarter zone
    else if (targetZoneId) {
      const targetZone = droppableZones[targetZoneId];
      const isHoveringOverItemInZone = targetZone.items.some((item) => item.id === over.id);

      // a class cannot have itself as a prereq
      currentPrereqs = currentPrereqs.filter(prereq => prereq != currentId);

      const totalUnits = getCurrentUnits(targetZoneId, droppableZones) + currentUnits;
      const prereqsCompleted = arePrereqsCompleted(targetZoneId, currentId, currentPrereqs);

      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // reordering within the same zone
        reorderZone(targetZoneId, event);
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // moving from one zone to another
        if (totalUnits <= MAX_UNITS && prereqsCompleted) {
          moveFromZoneToZone(sourceZoneId, targetZoneId, event);
          triggerElectricEffect(currentId);
        }
      } else if (isInDraggableList && foundItem) {
        // moving from category list to zone
        console.log('Found item');
        if (totalUnits <= MAX_UNITS && prereqsCompleted) {
          console.log('Entered prerequisite and unit check');
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
        .find((item) => item.id === activeId) ||
      Object.values(droppableZones)
        .flatMap((zone) => zone.items)
        .find((item) => item.id === activeId)
    : null;

  return {
    droppableZones,
    setDroppableZones,
    activeId,
    activeItem,
    electricCourseId,
    handleDragStart,
    handleDragOver,
    createHandleDragEnd,
  };
}

