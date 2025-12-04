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
    requirementGroups
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
    }, 1000);
  }, []);

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
    
    // remove from zone
    setDroppableZones((zones) => ({
      ...zones,
      [sourceZoneId]: {
        ...zones[sourceZoneId],
        items: zones[sourceZoneId].items.filter((i) => String(i.id) !== itemIdNormalized),
      },
    }));
    
    // add back to category
    addCourseToCategory(item, requirementGroups);
  }, [addCourseToCategory, requirementGroups]);

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
  const createHandleDragEnd = useCallback((arePrereqsCompleted) => (event) => {
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
    if (targetItem) {
      if (sourceZoneId) {
        const item = droppableZones[sourceZoneId].items.find((item) => String(item.id) === activeIdNormalized);
        if (item) {
          returnCourseToSidebar(item, sourceZoneId);
        }
      }
    } 
    // handle dropping on a category zone
    else if (isDroppedOnCategoryZone && sourceZoneId) {
      const item = droppableZones[sourceZoneId].items.find((item) => String(item.id) === activeIdNormalized);
      if (item) {
        returnCourseToSidebar(item, sourceZoneId);
      }
    } 
    // handle dropping on a quarter zone
    else if (targetZoneId) {
      const targetZone = droppableZones[targetZoneId];
      const isHoveringOverItemInZone = targetZone.items.some((item) => String(item.id) === overIdNormalized);

      const filteredPrereqGroups = (currentPrereqGroups || [])
        .map(group => group.filter(prereq => String(prereq) !== String(currentId)))
        .filter(group => group.length > 0);

      const totalUnits = getCurrentUnits(targetZoneId, droppableZones) + currentUnits;
      const prereqsCompleted = arePrereqsCompleted(targetZoneId, currentId, filteredPrereqGroups);

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
        if (totalUnits <= MAX_UNITS && prereqsCompleted) {
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
    handleDragStart,
    handleDragOver,
    createHandleDragEnd,
  };
}

