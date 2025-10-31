import React, { useState, useEffect, act } from 'react'

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

  // initialize items, will need to replace with a database call    
  const [draggableItems, setDraggableItems] = useState([
    { id: '1', name: 'COM SCI 31', units: 4 },
    { id: '2', name: 'COM SCI 32', units: 4},
    { id: '3', name: 'COM SCI 33', units: 4 },
    { id: '4', name: 'COM SCI 35L', units: 4 },
    { id: '5', name: 'COM SCI 111', units: 4 },
    { id: '6', name: 'COM SCI 180', units: 4 },
    { id: '7', name: 'COM SCI 118', units: 4 },
    { id: '8', name: 'COM SCI M151B', units: 4 },
    { id: '9', name: 'COM SCI M152A', units: 4 },
    { id: '10', name: 'COM SCI 181', units: 4 },
  ]);

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

    // if the item is still being dragged don't assign it to a box 
    if (!over) {
      setActiveId(null)
      return
    }

    // get the id of where the object came from
    let sourceZoneId = null
    for (const [key, zone] of Object.entries(droppableZones)) {
      if (zone.items.some((item) => item.id === active.id)) {
        currentName = zone.items[0].name
        currentUnits = zone.items[0].units
        sourceZoneId = key
        break
      }
    }

    // Check if the current item is in the original classes list
    const isInDraggableList = draggableItems.some((item) => item.id === active.id)
    if (isInDraggableList) {
      currentName = draggableItems.find((value) => value.id == active.id).name
      currentUnits = draggableItems.find((value) => value.id == active.id).units
    } 

    console.log(currentName)

    // Check if the current item is over a droppable zone
    let targetZoneId = Object.keys(droppableZones).find(
      (key) => droppableZones[key].id === over.id
    )

    // Check if the current item is over the classes list zone
    const isDroppedOnOriginalColumn = over.id === 'original-column'

    // find draggable item that current draggable item is hovering over
    const targetItem = draggableItems.find((item) => item.id === over.id)

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
          console.log(item)
          if (item) {
            setDroppableZones((zones) => ({
              ...zones,
              [sourceZoneId]: {
                ...zones[sourceZoneId],
                items: zones[sourceZoneId].items.filter((i) => i.id !== active.id),
              },
            }))
            setDraggableItems((items) => {
              const newIndex = items.findIndex((item) => item.id === over.id)
              const newItems = [...items]
              newItems.splice(newIndex, 0, item)
              return newItems
            })
          }
        }
      } else if (isInDraggableList) {
        // Reordering within draggable list
        setDraggableItems((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id)
          const newIndex = items.findIndex((item) => item.id === over.id)
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    } else if (isDroppedOnOriginalColumn && sourceZoneId) {
      // Moving from zone back to original column (dropped on zone, not item)
      // Check if original column has space
      if (draggableItems.length < MAX_ITEMS_PER_CONTAINER) {
        const item = droppableZones[sourceZoneId].items.find((item) => item.id === active.id)
        if (item) {
          setDroppableZones((zones) => ({
            ...zones,
            [sourceZoneId]: {
              ...zones[sourceZoneId],
              items: zones[sourceZoneId].items.filter((i) => i.id !== active.id),
            },
          }))
          setDraggableItems((items) => [...items, item])
        }
      }
    } else if (targetZoneId) {
      // Dropped on a zone (either directly or via hovering over an item in the zone)
      // Check if we're trying to reorder within the same zone by hovering over another item
      const targetZone = droppableZones[targetZoneId]
      const isHoveringOverItemInZone = targetZone.items.some((item) => item.id === over.id)
      const totalUnits = getCurrentUnits(targetZoneId) + currentUnits;
      console.log(totalUnits);
      
      if (sourceZoneId === targetZoneId && isHoveringOverItemInZone) {
        // Reordering within the same zone by hovering over another item
        setDroppableZones((zones) => {
          const zone = zones[targetZoneId]
          const oldIndex = zone.items.findIndex((item) => item.id === active.id)
          const newIndex = zone.items.findIndex((item) => item.id === over.id)
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
      } else if (sourceZoneId && sourceZoneId !== targetZoneId) {
        // Moving from one zone to another
        // Check if target zone has space
        const targetZone = droppableZones[targetZoneId]
        if (targetZone.items.length < MAX_ITEMS_PER_CONTAINER) {
          setDroppableZones((zones) => {
            const sourceZone = zones[sourceZoneId]
            const targetZone = zones[targetZoneId]
            const item = sourceZone.items.find((item) => item.id === active.id)
            
            if (item) {
              return {
                ...zones,
                [sourceZoneId]: {
                  ...sourceZone,
                  items: sourceZone.items.filter((i) => i.id !== active.id),
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
      } else if (isInDraggableList) {
        // Moving from draggable list to zone (either dropped on zone or item in zone)
        // Check if target zone has space
        const targetZone = droppableZones[targetZoneId]
        if (targetZone.items.length < MAX_ITEMS_PER_CONTAINER) {
          const item = draggableItems.find((item) => item.id === active.id)
          if (item) {
            setDraggableItems((items) => items.filter((i) => i.id !== active.id))
            setDroppableZones((zones) => ({
              ...zones,
              [targetZoneId]: {
                ...zones[targetZoneId],
                items: [...zones[targetZoneId].items, item],
              },
            }))
          }
        }
      } else if (!sourceZoneId && !isInDraggableList) {
        // Edge case: item is being moved from somewhere else to a zone
        // This shouldn't normally happen, but handle it gracefully
        const targetZone = droppableZones[targetZoneId]
        if (targetZone.items.length < MAX_ITEMS_PER_CONTAINER) {
          // Try to find the item in any zone (fallback)
          let itemToMove = null
          for (const zone of Object.values(droppableZones)) {
            const found = zone.items.find((item) => item.id === active.id)
            if (found) {
              itemToMove = found
              break
            }
          }
          if (itemToMove) {
            // Remove from source zone
            setDroppableZones((zones) => {
              const updatedZones = { ...zones }
              for (const [key, zone] of Object.entries(zones)) {
                if (zone.items.some((item) => item.id === active.id)) {
                  updatedZones[key] = {
                    ...zone,
                    items: zone.items.filter((i) => i.id !== active.id),
                  }
                  break
                }
              }
              // Add to target zone
              updatedZones[targetZoneId] = {
                ...zones[targetZoneId],
                items: [...zones[targetZoneId].items, itemToMove],
              }
              return updatedZones
            })
          }
        }
      }
    }

    setActiveId(null)
  }

  // Find active item from either draggable list or zones
  const activeItem = activeId
    ? draggableItems.find((item) => item.id === activeId) ||
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
        <h1>{major}</h1>
        <div className="content-wrapper">
          <Grid droppableZones={droppableZones}/>
          <Droppable
            id="original-column"  
            title="Classes"
            items={draggableItems}
          />
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="draggable-item dragging">{activeItem?.name}</div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}


