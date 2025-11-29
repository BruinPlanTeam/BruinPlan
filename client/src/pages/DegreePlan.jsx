import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useMajor } from '../providers/Major.jsx';
import { useCategorizedCourses } from '../hooks/useCategorizedCourses.js';
import { useCourseValidation } from '../hooks/useCourseValidation.js';
import { useDragAndDrop } from '../hooks/useDragAndDrop.js';

import PlanGrid from '../components/PlanGrid.jsx';
import CourseSidebar from '../components/CourseSidebar.jsx';

import { ProgressBar } from '../components/ProgressBar.jsx';
import { AIChatButton } from '../components/ai/AIChatButton.jsx';
import { AIChatPanel } from '../components/ai/AIChatPanel.jsx';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import '../styles/DegreePlan.css';


export default function DegreePlan() {
  
  const { major } = useMajor();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { 
    categorizedClasses, 
    addCourseToCategory, 
    removeCourseFromCategories,
    requirements 
  } = useCategorizedCourses(major);

  const {
    droppableZones,
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
    requirements 
  );
  
  const { arePrereqsCompleted } = useCourseValidation(droppableZones);


  useEffect(() =>  {
    function handleOnBeforeUnload(event){ event.preventDefault(); }
    window.addEventListener('beforeunload', handleOnBeforeUnload, { capture: true});
    return () => window.removeEventListener('beforeunload', handleOnBeforeUnload, { capture: true});
  }, []);

  const handleDragEnd = useMemo(() => {
    return createHandleDragEnd(arePrereqsCompleted);
  }, [createHandleDragEnd, arePrereqsCompleted]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );


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

          <ProgressBar requirements={requirements} droppableZones={droppableZones} />
          
          <div className="content-wrapper">
            
            <PlanGrid 
                droppableZones={droppableZones} 
                electricCourseId={electricCourseId} 
                activeId={activeId}
            />

            <CourseSidebar 
                categorizedClasses={categorizedClasses}
                electricCourseId={electricCourseId}
            />

          </div>

          <DragOverlay>
            {activeId ? (
              <div className="draggable-item dragging">
                <span className="course-code">{activeItem?.code}</span>
                <span className="course-units">{activeItem?.units}u</span>
              </div>
            ) : null}
          </DragOverlay>

          <AIChatButton onClick={() => setIsChatOpen(true)} />
          <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      </DndContext>
  );
}