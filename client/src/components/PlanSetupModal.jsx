import { useState, useEffect } from "react";
import { getRequirementDisplayName } from "../utils/requirementUtils";
import "../styles/PlanSetupModal.css";

export function PlanSetupModal({
    onCreateNew,
    onLoadPlan,
    getPlans,
    onSkip,
    setCurrentPlan,
    categorizedClasses,
    requirementGroups
}) {
    const [step, setStep] = useState("choice"); // "choice" | "load" | "name-plan"
    const [savedPlans, setSavedPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [newPlanName, setNewPlanName] = useState("");
    const [nameError, setNameError] = useState("");
    const [classes, setClasses] = useState([]);
    const [search, setSearch] = useState("");
    const [completedClasses, setCompletedClasses] = useState(new Set());
    const [selectedGeRequirements, setSelectedGeRequirements] = useState(new Set());

    useEffect(() => {
        if (categorizedClasses) {
            // only show prep classes in the list
            const prep = categorizedClasses['Prep'] || [];
            setClasses(prep);
        }
    }, [categorizedClasses]);

    const filteredClasses = classes.filter(course => 
        course.code?.toLowerCase().includes(search.toLowerCase()) ||
        course.name?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleCompleted = (courseId) => {
        setCompletedClasses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    const geRequirementItems = (requirementGroups || [])
        .filter(group => (group.type || '').toLowerCase() === 'ge')
        .flatMap(group =>
            (group.requirements || []).map(req => ({
                id: req.id,
                name: req.name,
                groupName: group.name
            }))
        );

    const toggleGeRequirement = (reqId) => {
        setSelectedGeRequirements(prev => {
            const next = new Set(prev);
            if (next.has(reqId)) {
                next.delete(reqId);
            } else {
                next.add(reqId);
            }
            return next;
        });
    };


    const handleLoadExisting = async () => {
        setLoadingPlans(true);
        try {
            const plans = await getPlans();
            setSavedPlans(plans);
            setStep("load");
        } catch (error) {
            console.error("Failed to load plans:", error);
        } finally {
            setLoadingPlans(false);
        }
    };

    const handleSelectPlan = (plan) => {
        onLoadPlan(plan);
    };

    const handleCreateNew = () => {
        setStep("name-plan");
    };

    const handleStartPlanning = () => {
        const trimmedName = newPlanName.trim();
        if (!trimmedName) {
            setNameError("Please enter a plan name");
            return;
        }
        // set current plan with name but no id (new plan)
        setCurrentPlan({ id: null, name: trimmedName });
        // prep completions (prep classes)
        const prepIds = Array.from(completedClasses);
        // ge completion is tracked via selectedgerequirements, no synthetic classes needed
        // pass combined completed class ids (quarter 0) and the explicit ge requirement ids
        onCreateNew(prepIds, Array.from(selectedGeRequirements));
    };

    return (
        <>
            <div className="setup-backdrop" />
            <div className="setup-modal">
                {step === "choice" && (
                    <>
                        <div className="setup-header">
                            <div className="setup-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 14v7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h1 className="setup-title">Welcome to CourseCompiler</h1>
                            <p className="setup-subtitle">Plan your UCLA journey</p>
                        </div>

                        <div className="setup-options">
                            <button className="setup-option-card" onClick={handleCreateNew}>
                                <div className="option-icon new">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="option-content">
                                    <h3>Create New Plan</h3>
                                    <p>Start fresh and build your degree plan from scratch</p>
                                </div>
                                <svg className="option-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            <button className="setup-option-card" onClick={handleLoadExisting} disabled={loadingPlans}>
                                <div className="option-icon load">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="option-content">
                                    <h3>{loadingPlans ? "Loading..." : "Load Saved Plan"}</h3>
                                    <p>Continue working on a plan you've saved before</p>
                                </div>
                                <svg className="option-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        <button className="setup-skip" onClick={onSkip}>
                            Skip for now
                        </button>
                    </>
                )}

                {step === "load" && (
                    <>
                        <div className="setup-header compact">
                            <button className="setup-back" onClick={() => setStep("choice")}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Back
                            </button>
                            <h2>Your Saved Plans</h2>
                            <p>Select a plan to continue editing</p>
                        </div>

                        <div className="setup-plans-list">
                            {savedPlans.length === 0 ? (
                                <div className="setup-empty">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <p>No saved plans yet</p>
                                    <button className="setup-create-instead" onClick={handleCreateNew}>
                                        Create your first plan
                                    </button>
                                </div>
                            ) : (
                                savedPlans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        className="setup-plan-card"
                                        onClick={() => handleSelectPlan(plan)}
                                    >
                                        <div className="plan-info">
                                            <h3>{plan.name}</h3>
                                            <span className="plan-meta">
                                                {plan.major?.name || "Unknown Major"} • {plan.quarters?.length || 0} quarters
                                            </span>
                                        </div>
                                        <svg className="plan-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                ))
                            )}
                        </div>
                    </>
                )}

                {step === "name-plan" && (
                    <>
                        <div className="setup-header compact">
                            <button className="setup-back" onClick={() => setStep("choice")}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Back
                            </button>
                            <h2>Name Your Plan</h2>
                            <p>Give your degree plan a memorable name</p>
                        </div>

                        <div className="setup-name-input-wrapper">
                            <input 
                                type="text" 
                                className={`setup-name-input ${nameError ? 'error' : ''}`}
                                value={newPlanName} 
                                onChange={(e) => {
                                    setNewPlanName(e.target.value);
                                    setNameError("");
                                }} 
                                placeholder="Plan Name" 
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleStartPlanning()}
                            />
                            {nameError && <span className="setup-name-error">{nameError}</span>}
                        </div>

                        {geRequirementItems.length > 0 && (
                            <div className="setup-classes-section" style={{ marginBottom: '1.5rem' }}>
                                    <label className="setup-classes-label">
                                        GE Requirements (check off ones you've already satisfied)
                                    </label>
                                <div className="setup-classes-list setup-classes-list--ge">
                                    {geRequirementItems.map(req => (
                                        <button
                                            key={req.id}
                                            className={`setup-class-item ${selectedGeRequirements.has(req.id) ? 'selected' : ''}`}
                                            onClick={() => toggleGeRequirement(req.id)}
                                        >
                                            <div className="setup-class-checkbox">
                                                {selectedGeRequirements.has(req.id) && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="setup-class-info">
                                                <span className="setup-class-name">
                                                    {getRequirementDisplayName(req.name)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="setup-classes-section">
                            <label className="setup-classes-label">
                                Mark completed Prep classes (AP credits, etc.)
                                <span className="setup-classes-count">
                                    {completedClasses.size} selected
                                </span>
                            </label>
                            <div className="setup-classes-list setup-classes-list--prep">
                                {(() => {
                                    const withSelectedFirst = [...filteredClasses].sort((a, b) => {
                                        const aSel = completedClasses.has(a.id);
                                        const bSel = completedClasses.has(b.id);
                                        if (aSel === bSel) {
                                            return a.code.localeCompare(b.code);
                                        }
                                        return aSel ? -1 : 1;
                                    });

                                    if (withSelectedFirst.length === 0) {
                                        return (
                                    <div className="setup-classes-empty">
                                        {search ? "No classes match your search" : (!categorizedClasses ? "Loading..." : "No classes available")}
                                    </div>
                                        );
                                    }

                                    return withSelectedFirst.map((course) => (
                                        <button 
                                            key={course.id}
                                            className={`setup-class-item ${completedClasses.has(course.id) ? 'selected' : ''}`}
                                            onClick={() => toggleCompleted(course.id)}
                                        >
                                            <div className="setup-class-checkbox">
                                                {completedClasses.has(course.id) && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M20 6L9 17l-5-5"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="setup-class-info">
                                                <span className="setup-class-code">{course.code}</span>
                                                <span className="setup-class-name">{course.name}</span>
                                            </div>
                                            <span className="setup-class-units">{course.units}u</span>
                                        </button>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="setup-actions">
                            <button className="setup-primary-btn" onClick={handleStartPlanning}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Start Planning
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

