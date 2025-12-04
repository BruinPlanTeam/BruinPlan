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
  // set up the grid zones for each quarter
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

  // flash the electric border when a course is successfully added
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

  // reorder courses within the same quarter
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

  // move a course from one quarter to another
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

  // return a course from the grid back to the available courses sidebar
  const returnCourseToSidebar = useCallback((item, sourceZoneId) => {
    const itemIdNormalized = String(item.id);
    // grab the full course object from the master list so we don't lose any properties
    const courseToAdd = allClassesMap[itemIdNormalized] || item;
    
    // remove it from the quarter zone
    setDroppableZones((zones) => ({
      ...zones,
      [sourceZoneId]: {
        ...zones[sourceZoneId],
        items: zones[sourceZoneId].items.filter((i) => String(i.id) !== itemIdNormalized),
      },
    }));
    
    // add it back to the sidebar - wait a frame so the zone update happens first
    requestAnimationFrame(() => {
      addCourseToCategory(courseToAdd, requirementGroups);
    });
  }, [addCourseToCategory, requirementGroups, allClassesMap]);

  // move a course from the sidebar into a quarter on the grid
  const moveCourseToZone = useCallback((targetZoneId, item) => {
    const courseId = String(item.id);
    // remove it from the sidebar
    removeCourseFromCategories(courseId);
    // add it to the target quarter
    setDroppableZones((zones) => ({
      ...zones,
      [targetZoneId]: {
        ...zones[targetZoneId],
        items: [...zones[targetZoneId].items, item],
      },
    }));
  }, [removeCourseFromCategories]);

  // track which course is being dragged
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // handle hover during drag (not used for anything right now)
  const handleDragOver = useCallback((event) => {
    const { active, over } = event;
  }, []);

  // handle drag end event - validation functions are injected from useCourseValidation
  const createHandleDragEnd = useCallback((arePrereqsCompleted, getMissingPrereqs, getBlockingDependents) => (event) => {
    const { active, over } = event;
    let currentName = null;
    let currentId = null;
    let currentUnits = null;
    let currentPrereqGroups = null;

    // if we dropped it outside of any valid target, just cancel
    if (!over) {
      setActiveId(null);
      return;
    }

    // helper to extract valid prereq groups from a course
    const getPrereqGroups = (item) => {
      if (!item || !Array.isArray(item.prereqGroups)) return [];
      return item.prereqGroups.filter(group => Array.isArray(group) && group.length > 0);
    };

    const activeIdNormalized = String(active.id);

    // figure out where this course is coming from (grid or sidebar)
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

    // check if it's coming from the sidebar
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

    // figure out which quarter zone we're dropping on
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    );

    // check if we're dropping on a sidebar category zone
    const isDroppedOnCategoryZone = over.id && over.id.startsWith('category-');

    const overIdNormalized = String(over.id);

    // check if we're dropping on another course in the sidebar
    let targetItem = null;
    for (const courseList of Object.values(categorizedClasses)) {
      const item = courseList.find((course) => String(course.id) === overIdNormalized);
      if (item) {
        targetItem = item;
        break;
      }
    }

    // if we didn't hit a zone directly, maybe we dropped on a course inside a zone
    if (!targetZoneId && !isDroppedOnCategoryZone && !targetItem) {
      for (const [key, zone] of Object.entries(droppableZones)) {
        if (zone.items.some((item) => String(item.id) === overIdNormalized)) {
          targetZoneId = key;
          break;
        }
      }
    }

    // dropping on the sidebar - return the course to available courses
    if (targetItem || (isDroppedOnCategoryZone && sourceZoneId)) {
      if (sourceZoneId && currentId != null) {
        const item = droppableZones[sourceZoneId].items.find((it) => String(it.id) === activeIdNormalized);
        if (item) {
          // check if any courses on the grid need this one as a prereq
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
    // dropping on a quarter zone on the grid
    else if (targetZoneId) {
      const targetZone = droppableZones[targetZoneId];
      const isHoveringOverItemInZone = targetZone.items.some(
        (item) => String(item.id) === overIdNormalized,
      );

      // filter out self-references from prereq groups
      const filteredPrereqGroups = (currentPrereqGroups || [])
        .map((group) => group.filter((prereq) => String(prereq) !== String(currentId)))
        .filter((group) => group.length > 0);

      // check total units and prereqs
      const totalUnits = getCurrentUnits(targetZoneId, droppableZones) + currentUnits;
      const prereqsCompleted = arePrereqsCompleted(
        targetZoneId,
        currentId,
        filteredPrereqGroups,
      );

      // check if any courses on the grid need this one as a prereq and would be blocked
      const blockingDependents = getBlockingDependents(targetZoneId, currentId);
      const hasBlockingDependents = blockingDependents.length > 0;

      const buildMissingPrereqsPayload = () => {
        const missingFromPrereqs = getMissingPrereqs(
          targetZoneId,
          currentId,
          filteredPrereqGroups,
        );
        return [...missingFromPrereqs];
      };

      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // just reordering within the same quarter
        reorderZone(targetZoneId, event);
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // moving from one quarter to another
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
            dependents: blockingDependents,
          });
        } else {
          moveFromZoneToZone(sourceZoneId, targetZoneId, event);
          triggerElectricEffect(currentId);
        }
      } else if (isInDraggableList && foundItem) {
        // moving from sidebar to a quarter on the grid
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
            dependents: blockingDependents,
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

  // get the full course object for whatever's being dragged
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

