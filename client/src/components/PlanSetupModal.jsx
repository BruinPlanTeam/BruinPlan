import { useState, useEffect } from "react";
import "../styles/PlanSetupModal.css";

export function PlanSetupModal({ onCreateNew, onLoadPlan, getPlans, onSkip }) {
    const [step, setStep] = useState("choice"); // "choice" | "load" | "completed-classes"
    const [savedPlans, setSavedPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

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
        setStep("completed-classes");
    };

    const handleSkipCompletedClasses = () => {
        onCreateNew([]);
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
                            <h1 className="setup-title">Welcome to BruinPlan</h1>
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

                {step === "completed-classes" && (
                    <>
                        <div className="setup-header compact">
                            <button className="setup-back" onClick={() => setStep("choice")}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Back
                            </button>
                            <h2>Completed Classes</h2>
                            <p>Select any classes you've already taken (optional)</p>
                        </div>

                        <div className="setup-completed-info">
                            <div className="info-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <p>
                                You can mark completed classes later by dragging them to past quarters. 
                                For now, let's get you started with your plan!
                            </p>
                        </div>

                        <div className="setup-actions">
                            <button className="setup-primary-btn" onClick={handleSkipCompletedClasses}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
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

