import React, { useState, useEffect, act } from 'react'
import { getMajorData } from '../services/majorDetailService.js'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import { Droppable } from '../components/ui/Droppable.jsx'
import { ProgressBar } from '../components/ProgressBar.jsx'
import { AIChatButton } from '../components/ai/AIChatButton.jsx'
import { AIChatPanel } from '../components/ai/AIChatPanel.jsx'
import { useMajor } from '../providers/Major.jsx'

import '../providers/Major.jsx'
import '../styles/DegreePlan.css'


const MAX_UNITS = 21;
const MAX_ROWS = 4;
const MAX_COLS = 4;

const QUARTERS = {
  1 : 'Fall',
  2 : 'Winter',
  3 : 'Spring',
  4 : 'Summer'
}

export default function DegreePlan() {
  const { major } = useMajor();

  const [classes, setClasses] = useState([])
  const [requirements, setRequirements] = useState([])
  const [categorizedClasses, setCategorizedClasses] = useState({
    'Preparation': [],
    'Major': [],
    'Tech Breadth': [],
    'Sci-Tech': [],
    'GE': []
  })

  useEffect(() =>  {
    function handleOnBeforeUnload(event){
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleOnBeforeUnload, { capture: true})
  }, [])


  useEffect(() =>  {
    async function fetchData(){
      try{
        const data = await getMajorData(major)
        setClasses(data.availableClasses)
        setRequirements(data.majorRequirements)
        categorizeClasses(data.availableClasses, data.majorRequirements)
        console.log("Acquired major data")
      } catch(e){
        console.error("Error retrieving majors: ", {major},  e)
      }
    }
    if (!major) return
    fetchData()
  }, [])

  // Categorize classes based on requirements
  const categorizeClasses = (allClasses, allRequirements) => {
    const categories = {
      'Preparation': [],
      'Major': [],
      'Tech Breadth': [],
      'GE': []
    };

    // Create a map of classId to requirement types
    const classToReqType = new Map();
    
    allRequirements.forEach(req => {
      const type = req.type || 'Other';
      const category = mapTypeToCategory(type, req.name);
      
      req.fulfilledByClassIds?.forEach(classId => {
        if (!classToReqType.has(classId)) {
          classToReqType.set(classId, category);
        }
      });
    });

    // Categorize each class
    allClasses.forEach(cls => {
      const category = classToReqType.get(Number(cls.id)) || 'GE';
      if (categories[category]) {
        categories[category].push(cls);
      } else {
        categories['GE'].push(cls);
      }
    });

    setCategorizedClasses(categories);
  };

  // Map requirement type/name to category
  const mapTypeToCategory = (type, name) => {
    const nameLower = name.toLowerCase();
    const typeLower = type.toLowerCase();

    if (nameLower.includes('preparation') || nameLower.includes('prep')) {
      return 'Preparation';
    }
    if (nameLower.includes('tech') && nameLower.includes('breadth')) {
      return 'Tech Breadth';
    }
    if (typeLower.includes('ge') || nameLower.includes('general education')) {
      return 'GE';
    }
    if (typeLower.includes('lower') || typeLower.includes('upper') || 
        typeLower.includes('major') || typeLower.includes('required')) {
      return 'Major';
    }
    
    return 'GE';
  };

  // initalize droppable zones inside a library
  const [droppableZones, setDroppableZones] = useState(() => {
    const zones = {}
    for (let row = 1; row <= 4; row++) {
      for (let col = 1; col <= 4; col++) {
        const zoneId = `zone-${row}-${col}`
        zones[zoneId] = {
          id: zoneId,
          title: `${QUARTERS[col]}`,
          items: [],
        }
      }
    }
    return zones
  })

  const [activeId, setActiveId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [electricZone, setElectricZone] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    // allows users to move the items with their keyboard
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAIChatClick = () => {
    setIsChatOpen(true);
  }

  const handleCloseChatPanel = () => {
    setIsChatOpen(false);
  }

  function getCurrentUnits(targetZoneId) {
    let totalUnits = 0;

    for (const [key, zone] of Object.entries(droppableZones)) {
      if (key === targetZoneId) {
        for (const item of zone.items) {
          totalUnits += item.units
        }
      }
    }
    return totalUnits;
  }

  function arePrereqsCompleted(targetZoneId, currentId, currentPrereqs) {
    let takenClasses = [];
    let unsatisfiedPrereqs = [];

    // Collect all classes that have been taken BEFORE the target zone
    outerLoop: for (let row = 1; row <= MAX_ROWS; row++) {
      for (let col = 1; col <= MAX_COLS; col ++) {
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
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Helper functions for moving classes around ////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function moveFromGridToClassList(sourceZoneId, item, event) {
    setDroppableZones((zones) => ({
      ...zones,
      [sourceZoneId]: {
        ...zones[sourceZoneId],
        items: zones[sourceZoneId].items.filter((i) => i.id !== event.active.id),
      },
    }))
    console.log("Item type: ", item.type);
    console.log("Item name: ", item.name);
    setClasses((items) => {
      const newIndex = items.findIndex((item) => item.id === event.over.id)
      const newItems = [...items]
      newItems.splice(newIndex, 0, item)
      return newItems
    })
  }

  function reorderClassesList(event) {
    setClasses((items) => {
      const oldIndex = items.findIndex((item) => item.id === event.active.id)
      const newIndex = items.findIndex((item) => item.id === event.over.id)
      return arrayMove(items, oldIndex, newIndex)
    })
  }

  function reorderZone(targetZoneId, event) {
    setDroppableZones((zones) => {
      const zone = zones[targetZoneId]
      const oldIndex = zone.items.findIndex((item) => item.id === event.active.id)
      const newIndex = zone.items.findIndex((item) => item.id === event.over.id)
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        return {
          ...zones,
          [targetZoneId]: {
            ...zone,
            items: arrayMove(zone.items, oldIndex, newIndex),
          },
        }
      }
      return zones
    })
  }

  function moveFromZoneToZone(sourceZoneId, targetZoneId, event) {
    setDroppableZones((zones) => {
      const sourceZone = zones[sourceZoneId]
      const targetZone = zones[targetZoneId]
      const item = sourceZone.items.find((item) => item.id === event.active.id)

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
        }
      }
      return zones
    })
  }

  function moveFromClassesListToGrid(targetZoneId, item, event) {
    setClasses((items) => items.filter((i) => i.id !== event.active.id))
    setDroppableZones((zones) => ({
      ...zones,
      [targetZoneId]: {
        ...zones[targetZoneId],
        items: [...zones[targetZoneId].items, item],
      },
    }))
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//// Define drag and drop handlers /////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    let currentName = null;
    let currentId = null;
    let currentUnits = null;
    let currentPrereqs = null;

    // if the item is still being dragged don't assign it to a box 
    if (!over) {
      setActiveId(null)
      return
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

    // Check if the current item is in any of the categorized lists
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

    // Check if the current item is over a droppable zone
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    )

    // Check if the current item is over any category zone
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

    // If not dropped directly on a zone, check if dropped on an item inside a zone
    // This allows dropping into zones even when hovering over items inside them
    if (!targetZoneId && !isDroppedOnCategoryZone && !targetItem) {
      // Find which zone contains the item we're hovering over
      for (const [key, zone] of Object.entries(droppableZones)) {
        if (zone.items.some((item) => item.id === over.id)) {
          targetZoneId = key
          break
        }
      }
    }

    if (targetItem) {
      if (sourceZoneId) {
        // Moving from zone to original column at specific position
        // Check if original column has space (if item is already there, it's reordering)
        if (!isInDraggableList) {
          const item = droppableZones[sourceZoneId].items.find((item) => item.id === active.id)
          if (item) {
            moveFromGridToClassList(sourceZoneId, item, event);
          }
        }
      } else if (isInDraggableList) {
        // Reordering within category lists - do nothing, they're separate zones
      }
    } else if (isDroppedOnCategoryZone && sourceZoneId) {
      // Moving from zone back to original column (dropped on zone, not item)
      // Check if original column has space
        const item = droppableZones[sourceZoneId].items.find((item) => item.id === active.id)  
        if (item) {
          setDroppableZones((zones) => ({
            ...zones,  
            [sourceZoneId]: { 
              ...zones[sourceZoneId],  
              items: zones[sourceZoneId].items.filter((i) => i.id !== active.id),  
            },  
          }))
          // Add back to appropriate category
          setCategorizedClasses(prev => {
            const updated = { ...prev };
            for (const [category, courseList] of Object.entries(updated)) {
              if (courseList.some(c => c.id === item.id)) {
                return updated; // Already in a category
              }
            }
            // Add to GE if not found
            updated['GE'] = [...updated['GE'], item];
            return updated;
          });
        }  
    }  else if (targetZoneId) {
      // Dropped on a zone (either directly or via hovering over an item in the zone)
      // Check if we're trying to reorder within the same zone by hovering over another item

      const targetZone = droppableZones[targetZoneId]
      const isHoveringOverItemInZone = targetZone.items.some((item) => item.id === over.id)

      // NEED TO CHANGE PREREQ HANDLING: A CLASS CANNOT HAVE ITSELF AS A PREREQ
      currentPrereqs = currentPrereqs.filter(prereq => prereq != currentId);

      const totalUnits = getCurrentUnits(targetZoneId) + currentUnits;
      const prereqsCompleted = arePrereqsCompleted(targetZoneId, currentId, currentPrereqs);

      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // Reordering within the same zone by hovering over another item
        reorderZone(targetZoneId, event);
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // Moving from one zone to another
        // Check if target zone has space
        if (totalUnits <= MAX_UNITS && prereqsCompleted) {
          moveFromZoneToZone(sourceZoneId, targetZoneId, event);
          // Show electric border effect
          setElectricZone(targetZoneId);
          setTimeout(() => setElectricZone(null), 500);
        }
      } else if (isInDraggableList && foundItem) {
        // Moving from category list to zone (either dropped on zone or item in zone)
        // Check if target zone has space and prereqs are met
        if (totalUnits <= MAX_UNITS && prereqsCompleted) {
          // Remove from category list
          setCategorizedClasses(prev => {
            const updated = { ...prev };
            for (const [category, courseList] of Object.entries(updated)) {
              updated[category] = courseList.filter(c => c.id !== foundItem.id);
            }
            return updated;
          });
          
          // Add to zone
          setDroppableZones((zones) => ({
            ...zones,
            [targetZoneId]: {
              ...zones[targetZoneId],
              items: [...zones[targetZoneId].items, foundItem],
            },
          }));
          
          // Show electric border effect
          setElectricZone(targetZoneId);
          setTimeout(() => setElectricZone(null), 500);
        }
      }
    }

    setActiveId(null)
  }

  // Find active item from either category lists or zones
  const activeItem = activeId
    ? Object.values(categorizedClasses)
        .flat()
        .find((item) => item.id === activeId) ||
      Object.values(droppableZones)
        .flatMap((zone) => zone.items)
        .find((item) => item.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
        <div className="app-container">
          <div className="plan-header">
            <h1>{major}</h1>
            <p className="plan-subtitle">Drag and drop courses to build your 4-year plan</p>
          </div>

          {/* Progress Bar */}
          <ProgressBar requirements={requirements} droppableZones={droppableZones} />
          
          <div className="content-wrapper">
          {/* 4-Year Plan Grid */}
          <div className="plan-grid">
            {[1, 2, 3, 4].map((year) => (
              <div key={year} className="year-row">
                <div className="year-label">Year {year}</div>
                <div className="quarters-row">
                  {[1, 2, 3, 4].map((quarter) => {
                    const zoneId = `zone-${year}-${quarter}`;
                    const zone = droppableZones[zoneId];
                    const units = getCurrentUnits(zoneId);
                    return (
                      <Droppable
                        key={zoneId}
                        id={zoneId}
                        title={zone.title}
                        items={zone.items}
                        units={units}
                        maxUnits={MAX_UNITS}
                        showElectric={electricZone === zoneId}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Available Courses Sidebar */}
          <div className="sidebar-container">
            <div className="sidebar-header">
              <h2>Available Courses</h2>
              <span className="course-count">{classes.length}</span>
            </div>
            
            {/* Categorized Course Lists */}
            <div className="course-categories">
              {Object.entries(categorizedClasses).map(([category, courseList]) => (
                courseList.length > 0 && (
                  <div key={category} className="course-category">
                    <div className="category-header">
                      <h3>{category}</h3>
                      <span className="category-count">{courseList.length}</span>
                    </div>
                    <Droppable
                      id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      title=""
                      items={courseList}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="draggable-item dragging">
              <span className="course-code">{activeItem?.code}</span>
              <span className="course-units">{activeItem?.units}u</span>
            </div>
          ) : null}
        </DragOverlay>

        {/* AI Chat Button */}
        <AIChatButton onClick={handleAIChatClick} />

        {/* AI Chat Panel */}
        <AIChatPanel isOpen={isChatOpen} onClose={handleCloseChatPanel} />
      </div>
    </DndContext>
  )
}
