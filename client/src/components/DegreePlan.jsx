import React, { useState, useEffect } from 'react'
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
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import { Droppable } from './Droppable'
import { ProgressBar } from './ProgressBar'
import { AIChatButton } from './AIChatButton'
import { AIChatPanel } from './AIChatPanel'
import { useMajor } from '../Major.jsx'
import { Grid } from './Grid'

// Custom hooks
import { useCourseValidation } from '../hooks/useCourseValidation'
import { useCategorizedCourses } from '../hooks/useCategorizedCourses'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { getCurrentUnits } from '../utils/courseUtils'
import { getJson } from "../utils/getGridData"

import '../Major.jsx'
import '../DegreePlan.css'

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
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Use custom hooks for categorization
  const {
    categorizedClasses,
    categorizeClasses,
    addCourseToCategory,
    removeCourseFromCategories,
    mapTypeToCategory
  } = useCategorizedCourses();

  // Use custom hooks for validation (needs to be after droppableZones)
  // We'll initialize this after drag and drop hook

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Prevent unload without warning
  useEffect(() =>  {
    function handleOnBeforeUnload(event){
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleOnBeforeUnload, { capture: true})
  }, [])

  // Fetch major data
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
  }, [major, categorizeClasses])

  // Initialize drag and drop
  const {
    droppableZones,
    setDroppableZones,
    activeId,
    activeItem,
    electricCourseId,
    handleDragStart,
    handleDragOver,
    createHandleDragEnd,
  } = useDragAndDrop(
    categorizedClasses,
    addCourseToCategory,
    removeCourseFromCategories,
    requirements,
    mapTypeToCategory
  );

  // Create validation hook with droppableZones
  const { arePrereqsCompleted } = useCourseValidation(droppableZones);

  // Create the drag end handler with validation
  const handleDragEnd = createHandleDragEnd(arePrereqsCompleted);

  const handleAIChatClick = () => {
    setIsChatOpen(true);
    getJson(droppableZones);
  }

  const handleCloseChatPanel = () => {
    setIsChatOpen(false);
  }

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
          <Grid droppableZones={droppableZones} electricCourseId={electricCourseId} />

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
              <span className="course-units">{activeItem?.units}</span>
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
