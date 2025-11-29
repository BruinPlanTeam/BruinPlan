import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { useMajor } from '../providers/Major.jsx';
import { useCategorizedCourses } from '../hooks/useCategorizedCourses.js';
import { useCourseValidation } from '../hooks/useCourseValidation.js';
import { useDragAndDrop } from '../hooks/useDragAndDrop.js';

import PlanGrid from '../components/PlanGrid.jsx';
import CourseSidebar from '../components/CourseSidebar.jsx';

import { ProgressBar } from '../components/ProgressBar.jsx';
import { SavedPlansButton } from '../components/SavedPlansButton.jsx';
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
import { usePlanManager } from '../hooks/planManager.js';


export default function DegreePlan() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    major,
    loadPlan,
    categorizedClasses, 
    requirements,
    droppableZones,
    setDroppableZones,
    activeId,
    activeItem,
    electricCourseId,
    handleDragStart,
    handleDragOver,
    createHandleDragEnd,
    arePrereqsCompleted
  } = usePlanManager();

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

  const getPlans = () => {
    const tempSavedPlan = {
      "zone-1-1": { id: "zone-1-1", title: "Fall", items: [{id: 14, code: "MATH 31A", units: 4, description: "ayo???", prereqIds: []}] },
      "zone-1-2": { id: "zone-1-2", title: "Fall", items: [] },
      "zone-1-3": { id: "zone-1-3", title: "Fall", items: [] },
      "zone-1-4": { id: "zone-1-4", title: "Fall", items: [] },
      "zone-2-1": { id: "zone-2-1", title: "Fall", items: [] },
      "zone-2-2": { id: "zone-2-2", title: "Fall", items: [] },
      "zone-2-3": { id: "zone-2-3", title: "Fall", items: [] },
      "zone-2-4": { id: "zone-2-4", title: "Fall", items: [] },
      "zone-3-1": { id: "zone-3-1", title: "Fall", items: [] },
      "zone-3-2": { id: "zone-3-2", title: "Fall", items: [] },
      "zone-3-3": { id: "zone-3-3", title: "Fall", items: [] },
      "zone-3-4": { id: "zone-3-4", title: "Fall", items: [] },
      "zone-4-1": { id: "zone-4-1", title: "Fall", items: [] },
      "zone-4-2": { id: "zone-4-2", title: "Fall", items: [] },
      "zone-4-3": { id: "zone-4-3", title: "Fall", items: [] },
      "zone-4-4": { id: "zone-4-4", title: "Fall", items: [] },
    };
    loadPlan(tempSavedPlan);
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

          <ProgressBar requirements={requirements} droppableZones={droppableZones} />
          <SavedPlansButton handleLoadScreen={loadPlan} getPlans={getPlans}/>
          
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