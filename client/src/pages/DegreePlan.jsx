import React, { useState, useEffect, useMemo, useCallback } from 'react';

import PlanGrid from '../components/PlanGrid.jsx';
import CourseSidebar from '../components/CourseSidebar.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { Header } from '../components/Header.jsx';
import { SavedPlansButton } from '../components/SavedPlansButton.jsx';
import { SavePlanButton } from '../components/SavePlanButton.jsx';
import { LeavePlanButton } from '../components/LeavePlanButton.jsx';
import { AIChatButton } from '../components/ai/AIChatButton.jsx';
import { AIChatPanel } from '../components/ai/AIChatPanel.jsx';
import { PlanSetupModal } from '../components/PlanSetupModal.jsx';
import { ModifyPlanModal } from '../components/ModifyPlanModal.jsx';
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
  const [isEditingPlanName, setIsEditingPlanName] = useState(false);
  const [planNameValue, setPlanNameValue] = useState('');
  const [showModifyPlanModal, setShowModifyPlanModal] = useState(false);
  const [geRequirementSelections, setGeRequirementSelections] = useState(new Set());
  const { isAuthenticated, setOnSessionExpiring, clearOnSessionExpiring } = useAuth();

  const {
    major,
    savePlan,
    getPlans,
    loadPlan,
    deletePlan,
    leavePlan,
    updatePlanName,
    categorizedClasses, 
    requirementGroups,
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
    arePrereqsCompleted,
    completedClasses,
    setCompletedClassesFromIds,
    allClasses,
    allClassesMap,
    getMissingPrereqs,
    getBlockingDependents
  } = usePlanManager();

  // check for pending plan to load from profile page
  useEffect(() => {
    const pendingPlan = localStorage.getItem('pendingPlanToLoad');
    if (pendingPlan) {
      try {
        const planData = JSON.parse(pendingPlan);
        loadPlan(planData);
        setCurrentPlan({ id: planData.id, name: planData.name });
        setHasCompletedSetup(true); // bypass setup modal when loading from profile
        localStorage.removeItem('pendingPlanToLoad');
      } catch (error) {
        console.error('Failed to load pending plan:', error);
        localStorage.removeItem('pendingPlanToLoad');
      }
    }
  }, [loadPlan]);

  // show browser confirmation when leaving the page
  useEffect(() => {
    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = ''; // modern browsers require returnvalue to be set
      return ''; // some browsers require return value
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // register autosave callback for session expiration
  useEffect(() => {
    if (!isAuthenticated || !currentPlan) {
      clearOnSessionExpiring();
      return;
    }

    // register autosave callback that will be called 10 seconds before jwt expiration
    const autosaveCallback = async () => {
      try {
        // autosave the current plan
        const planName = currentPlan.name;
        const planId = currentPlan.id;
        await savePlan(planName, planId);
        console.log('Plan autosaved before session expiration');
      } catch (error) {
        console.error('Failed to autosave plan before session expiration:', error);
        // don't throw - we still want to logout even if autosave fails
      }
    };

    setOnSessionExpiring(autosaveCallback);

    // cleanup on unmount or when dependencies change
    return () => {
      clearOnSessionExpiring();
    };
  }, [isAuthenticated, currentPlan, savePlan, setOnSessionExpiring, clearOnSessionExpiring]);

  const handleDragEnd = useMemo(() => {
    return createHandleDragEnd(arePrereqsCompleted, getMissingPrereqs, getBlockingDependents);
  }, [createHandleDragEnd, arePrereqsCompleted, getMissingPrereqs, getBlockingDependents]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // handlers for setup modal
  const handleCreateNewPlan = (completedClassIds, geRequirementIds = []) => {
    // store completed classes (will be saved as quarter 0 when plan is saved)
    // the useeffect in planmanager will remove them from the sidebar
    setCompletedClassesFromIds(completedClassIds);
    setGeRequirementSelections(new Set(geRequirementIds));
    setHasCompletedSetup(true);
  };

  const handleLoadPlanFromSetup = (plan) => {
    loadPlan(plan);
    setCurrentPlan({ id: plan.id, name: plan.name });
    setHasCompletedSetup(true);
    setGeRequirementSelections(new Set());
  };

  const handleSkipSetup = () => {
    setCurrentPlan(null);
    setHasCompletedSetup(true);
  };

  // handler for loading plan from saved plans button
  const handleLoadPlanFromButton = (plan) => {
    loadPlan(plan);
    setCurrentPlan({ id: plan.id, name: plan.name });
    setHasCompletedSetup(true); // bypass setup modal when loading from saved plans button
    setGeRequirementSelections(new Set());
  };

  // handler for saving - passes planid for updates, null for new plans
  const handleSavePlan = async (planName) => {
    const planId = currentPlan?.id || null;
    const result = await savePlan(planName, planId);
    setCurrentPlan({ id: result.id, name: result.name });
    return result;
  };

  // handler for leaving the plan
  const handleLeavePlan = () => {
    leavePlan();
    // clear ge requirement selections
    setGeRequirementSelections(new Set());
    setCurrentPlan(null);
    // keep currentplan - don't set it to null, just empty the plan
  };

  // handler for editing plan name
  const handleEditPlanName = () => {
    if (currentPlan) {
      setPlanNameValue(currentPlan.name);
      setIsEditingPlanName(true);
    }
  };

  const handleSavePlanName = async () => {
    if (!currentPlan || !planNameValue.trim()) return;
    try {
      await updatePlanName(currentPlan.id, planNameValue.trim());
      setCurrentPlan({ ...currentPlan, name: planNameValue.trim() });
      setIsEditingPlanName(false);
    } catch (error) {
      console.error('Failed to update plan name:', error);
      alert('Failed to update plan name');
    }
  };

  const handleCancelEditPlanName = () => {
    setIsEditingPlanName(false);
    setPlanNameValue('');
  };

  const handleModifyPlanSave = async (newName, completedClassIds) => {
    if (!currentPlan) return;
    
    try {
      // convert to set for saveplan
      const completedClassesSet = new Set(completedClassIds.map(id => String(id)));
      
      // update completed classes state
      setCompletedClassesFromIds(completedClassIds);
      
      // update plan name if changed
      if (newName !== currentPlan.name) {
        await updatePlanName(currentPlan.id, newName);
        setCurrentPlan({ ...currentPlan, name: newName });
      }
      
      // save the plan with updated completed classes (quarter 0)
      // pass completedclassesset directly to avoid race condition
      const planId = currentPlan.id;
      const result = await savePlan(newName, planId, completedClassesSet);
      setCurrentPlan({ id: result.id, name: result.name });
      
      setShowModifyPlanModal(false);
    } catch (error) {
      console.error('Failed to modify plan:', error);
      alert(error.message || 'Failed to modify plan');
    }
  };

  // show setup modal for authenticated users who haven't completed setup
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
              <div className="plan-title-section">
                {isEditingPlanName && currentPlan ? (
                  <div className="plan-title-edit">
                    <input
                      type="text"
                      value={planNameValue}
                      onChange={(e) => setPlanNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePlanName();
                        if (e.key === 'Escape') handleCancelEditPlanName();
                      }}
                      className="plan-title-input"
                      autoFocus
                    />
                    <button onClick={handleSavePlanName} className="plan-title-save-btn">✓</button>
                    <button onClick={handleCancelEditPlanName} className="plan-title-cancel-btn">✕</button>
                  </div>
                ) : (
                  <div className="plan-title-wrapper">
                    <h1>{currentPlan?.name || major}</h1>
                    {currentPlan && isAuthenticated && (
                      <button onClick={() => setShowModifyPlanModal(true)} className="modify-plan-btn" aria-label="Modify plan">
                        Modify Plan
                      </button>
                    )}
                  </div>
                )}
                <p className="plan-subtitle">
                  {currentPlan ? `${major} • ` : ''}Drag and drop courses to build your 4-year plan
                </p>
              </div>
              {isAuthenticated && 
                <div className="plan-actions">
                  <SavedPlansButton handleLoadScreen={handleLoadPlanFromButton} getPlans={getPlans} deletePlan={deletePlan} currentPlan={currentPlan}/>
                  <SavePlanButton handleSavePlan={handleSavePlan} currentPlan={currentPlan}/>
                  <LeavePlanButton onLeave={handleLeavePlan}/>
                </div>
              }
            </div>
          </div>

          <ProgressBar
            requirementGroups={requirementGroups}
            droppableZones={droppableZones}
            completedClasses={completedClasses}
            allClassesMap={allClassesMap}
            selectedGeRequirements={geRequirementSelections}
          />
          
          <div className="content-wrapper">
            
            <PlanGrid 
                droppableZones={droppableZones} 
                electricCourseId={electricCourseId} 
                activeId={activeId}
                requirementGroups={requirementGroups}
                allClassesMap={allClassesMap}
            />

            <CourseSidebar 
                categorizedClasses={categorizedClasses}
                electricCourseId={electricCourseId}
                requirementGroups={requirementGroups}
                allClassesMap={allClassesMap}
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

      {rejectedCourseInfo && (
        <div className="rejection-popup-backdrop" onClick={() => setRejectedCourseInfo(null)}>
          <div className="rejection-popup" onClick={(e) => e.stopPropagation()}>
            <div className="rejection-popup-header">
              <h3>
                {rejectedCourseInfo.reason === 'dependents'
                  ? `${rejectedCourseInfo.courseCode} is required by other classes`
                  : `Cannot Add ${rejectedCourseInfo.courseCode}`}
              </h3>
              <button className="rejection-popup-close" onClick={() => setRejectedCourseInfo(null)}>×</button>
            </div>
            <div className="rejection-popup-content">
              {rejectedCourseInfo.reason === 'units' ? (
                <p>{rejectedCourseInfo.message}</p>
              ) : rejectedCourseInfo.reason === 'dependents' ? (
                <>
                  <p className="rejection-message">
                    These courses on your map still need {rejectedCourseInfo.courseCode}. Move or remove them first:
                  </p>
                  <div className="prereq-groups">
                    {(rejectedCourseInfo.dependents || []).map((code, idx) => (
                      <span key={idx} className="prereq-course-code">{code}</span>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p>You need to schedule these prerequisite courses in earlier quarters first:</p>
                  <div className="prereq-groups">
                    {(rejectedCourseInfo.missingPrereqs || []).map((group, idx) => (
                      <div key={idx} className="prereq-group">
                        <span className="prereq-group-label">Group {idx + 1} (choose one):</span>
                        <div className="prereq-courses">
                          {group.map((code, codeIdx) => (
                            <span key={codeIdx} className="prereq-course-code">{code}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="prereq-hint">Drag these courses into earlier quarters first, then try adding {rejectedCourseInfo.courseCode} again.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSetupModal && (
        <PlanSetupModal
          onCreateNew={handleCreateNewPlan}
          onLoadPlan={handleLoadPlanFromSetup}
          getPlans={getPlans}
          onSkip={handleSkipSetup}
          setCurrentPlan={setCurrentPlan}
          categorizedClasses={categorizedClasses}
          requirementGroups={requirementGroups}
        />
      )}

      {showModifyPlanModal && currentPlan && (
        <ModifyPlanModal
          plan={currentPlan}
          onSave={handleModifyPlanSave}
          onClose={() => setShowModifyPlanModal(false)}
          categorizedClasses={categorizedClasses}
          currentCompletedClasses={completedClasses}
          droppableZones={droppableZones}
          allClasses={allClasses}
          requirementGroups={requirementGroups}
          initialGeSelections={geRequirementSelections}
          onGeSelectionsChange={setGeRequirementSelections}
        />
      )}
    </div>
  );
}