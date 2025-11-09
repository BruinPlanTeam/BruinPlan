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

import { Header } from './Header'
import { Grid } from './Grid'
import { Droppable } from './Droppable'
import { useMajor } from '../Major.jsx'

import '../Major.jsx'
import '../DegreePlan.css'


const MAX_ITEMS_PER_CONTAINER = 5 
const MAX_UNITS = 21;

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

  // initialize items, will need to replace with a database call    
  const [draggableItems, setDraggableItems] = useState([
    { id: '1', name: 'COM SCI 31', units: 4, prereqs: [] },
    { id: '2', name: 'COM SCI 32', units: 4, prereqs: [] },
    { id: '3', name: 'COM SCI 33', units: 4, prereqs: [] },
    { id: '4', name: 'COM SCI 35L', units: 4, prereqs: [] },
    { id: '5', name: 'COM SCI 111', units: 4, prereqs: ['1', '2', '3'] },
    { id: '6', name: 'COM SCI 180', units: 4, prereqs: [] },
    { id: '7', name: 'COM SCI 118', units: 4, prereqs: [] },
    { id: '8', name: 'COM SCI M151B', units: 4, prereqs: [] },
    { id: '9', name: 'COM SCI M152A', units: 4, prereqs: [] },
    { id: '10', name: 'COM SCI 181', units: 4, prereqs: [] },
  ]);


  useEffect(() =>  {
    async function fetchData(){
      try{
        const data = await getMajorData(major)
        setClasses(data.availableClasses)
        setRequirements(data.majorRequirements)
        console.log("Acquired major data")
      } catch(e){
        console.error("Error retrieving majors: ", {major},  e)
      }
    }
    fetchData()
  }, [])


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

  const sensors = useSensors(
    useSensor(PointerSensor),
    // allows users to move the items with their keyboard
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  //
  //function arePrereqsCompleted(currentPrereqs) {
    //for (const prereq of currentPrereqs) {
      //if (draggableItems.some(item => item.id === prereq)) {
        //console.log(`Class #${prereq} is still in the list`);
       // return false
     // }
    //}
   // return true;
  //}

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
    let currentUnits = null;
    let currentPrereqs = null;

    // if the item is still being dragged don't assign it to a box 
    if (!over) {
      setActiveId(null)
      return
    }

    // get the id of where the object came from
    let sourceZoneId = null
    for (const [key, zone] of Object.entries(droppableZones)) {
      if (zone.items.some((item) => item.id === active.id)) {
        currentName = zone.items[0].code
        currentUnits = zone.items[0].units
        currentPrereqs = zone.items[0].prereqIds
        sourceZoneId = key
        break
      }
    }

    // Check if the current item is in the original classes list
    const isInDraggableList = classes.some((item) => item.id === active.id)
    if (isInDraggableList) {
      let item = classes.find((value) => value.id == active.id);
      currentName = item.code;
      currentUnits = item.units;
      currentPrereqs = item.prereqIds;
    } 

    // Check if the current item is over a droppable zone
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    )

    // Check if the current item is over the classes list zone
    const isDroppedOnOriginalColumn = over.id === 'original-column'

    // find draggable item that current draggable item is hovering over
    const targetItem = classes.find((item) => item.id === over.id)

    // If not dropped directly on a zone, check if dropped on an item inside a zone
    // This allows dropping into zones even when hovering over items inside them
    if (!targetZoneId && !isDroppedOnOriginalColumn && !targetItem) {
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
        // Reordering within draggable list
        reorderClassesList(event);
      }
    } else if (targetZoneId) {
      // Dropped on a zone (either directly or via hovering over an item in the zone)
      // Check if we're trying to reorder within the same zone by hovering over another item

      const targetZone = droppableZones[targetZoneId]
      const isHoveringOverItemInZone = targetZone.items.some((item) => item.id === over.id)

      const totalUnits = getCurrentUnits(targetZoneId) + currentUnits;
      //const prereqsCompleted = arePrereqsCompleted(currentPrereqs);

      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // Reordering within the same zone by hovering over another item
        reorderZone(targetZoneId, event);
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // Moving from one zone to another
        // Check if target zone has space
        if (totalUnits < MAX_UNITS && prereqsCompleted) {
          moveFromZoneToZone(sourceZoneId, targetZoneId, event);
        }
      } else if (isInDraggableList) {
        // Moving from draggable list to zone (either dropped on zone or item in zone)
        // Check if target zone has space
        if (totalUnits < MAX_UNITS ) {
          const item = classes.find((item) => item.id === active.id)
          if (item) {
            moveFromClassesListToGrid(targetZoneId, item, event);
          }
        }
      }
    }

    setActiveId(null)
  }

  // Find active item from either draggable list or zones
  const activeItem = activeId
    ? classes.find((item) => item.id === activeId) ||
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
      <Header/ >
      <div className="app-container">
        <h1>{major}</h1>
        <div className="content-wrapper">
          <Grid droppableZones={droppableZones}/>
          <Droppable
            id="original-column"  
            title="Classes"
            items={classes}
          />
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="draggable-item dragging">{activeItem?.code}</div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}


