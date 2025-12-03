import React, { useState, useEffect, useMemo, useCallback } from 'react';

import PlanGrid from '../components/PlanGrid.jsx';
import CourseSidebar from '../components/CourseSidebar.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { Header } from '../components/Header.jsx';
import { SavedPlansButton } from '../components/SavedPlansButton.jsx';
import { SavePlanButton } from '../components/SavePlanButton.jsx';
import { ResetPlanButton } from '../components/ResetPlanButton.jsx';
import { AIChatButton } from '../components/ai/AIChatButton.jsx';
import { AIChatPanel } from '../components/ai/AIChatPanel.jsx';
import { PlanSetupModal } from '../components/PlanSetupModal.jsx';
import { Footer } from '../components/Footer.jsx';
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
import { useAuth } from '../contexts/AuthContext';


export default function DegreePlan() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null); // { id, name } or null for new plans
  const { isAuthenticated } = useAuth();

  const {
    major,
    savePlan,
    getPlans,
    loadPlan,
    deletePlan,
    resetPlan,
    categorizedClasses, 
    requirementGroups,
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

  // check for pending plan to load from Profile page
  useEffect(() => {
    const pendingPlan = localStorage.getItem('pendingPlanToLoad');
    if (pendingPlan) {
      try {
        const planData = JSON.parse(pendingPlan);
        loadPlan(planData);
        localStorage.removeItem('pendingPlanToLoad');
      } catch (error) {
        console.error('Failed to load pending plan:', error);
        localStorage.removeItem('pendingPlanToLoad');
      }
    }
  }, [loadPlan]);

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

  // Handlers for setup modal
  const handleCreateNewPlan = (completedClasses) => {
    // completedClasses can be used later if we add that feature
    // Note: currentPlan is already set by the modal with the plan name
    setHasCompletedSetup(true);
  };

  const handleLoadPlanFromSetup = (plan) => {
    loadPlan(plan);
    setCurrentPlan({ id: plan.id, name: plan.name });
    setHasCompletedSetup(true);
  };

  const handleSkipSetup = () => {
    setCurrentPlan(null);
    setHasCompletedSetup(true);
  };

  // Handler for loading plan from SavedPlansButton
  const handleLoadPlanFromButton = (plan) => {
    loadPlan(plan);
    setCurrentPlan({ id: plan.id, name: plan.name });
  };

  // Handler for saving - passes planId for updates, null for new plans
  const handleSavePlan = async (planName) => {
    const planId = currentPlan?.id || null;
    const result = await savePlan(planName, planId);
    setCurrentPlan({ id: result.id, name: result.name });
    return result;
  };

  // Handler for resetting the plan
  const handleResetPlan = () => {
    resetPlan();
    setCurrentPlan(null);
  };

  // Show setup modal for authenticated users who haven't completed setup
  const showSetupModal = isAuthenticated && !hasCompletedSetup;

  return (
    <div className="degree-plan-page">
      <Header />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd} 
      >
        <div className="app-container">
          <div className="plan-header">
            <div className="plan-header-content">
              <div>
                <h1>{currentPlan?.name || major}</h1>
                <p className="plan-subtitle">
                  {currentPlan ? `${major} • ` : ''}Drag and drop courses to build your 4-year plan
                </p>
              </div>
              {isAuthenticated && 
                <div className="plan-actions">
                  <SavedPlansButton handleLoadScreen={handleLoadPlanFromButton} getPlans={getPlans} deletePlan={deletePlan} currentPlan={currentPlan}/>
                  <SavePlanButton handleSavePlan={handleSavePlan} currentPlan={currentPlan}/>
                  <ResetPlanButton onReset={handleResetPlan}/>
                </div>
              }
            </div>
          </div>

          <ProgressBar requirementGroups={requirementGroups} droppableZones={droppableZones} />
          
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
      <Footer />

      {showSetupModal && (
        <PlanSetupModal
          onCreateNew={handleCreateNewPlan}
          onLoadPlan={handleLoadPlanFromSetup}
          getPlans={getPlans}
          onSkip={handleSkipSetup}
          setCurrentPlan={setCurrentPlan}
          categorizedClasses={categorizedClasses}
        />
      )}
    </div>
  );
}