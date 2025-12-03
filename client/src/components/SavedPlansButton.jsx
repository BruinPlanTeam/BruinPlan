import { useState } from "react";
import { PlansPopUp } from "./PlansPopUp";
import "../styles/PlanActionButton.css";

export function SavedPlansButton({ handleLoadScreen, getPlans, deletePlan, currentPlan }) {
    const [showPlans, setShowPlans] = useState(false);
    const [savedPlans, setSavedPlans] = useState([]);

    const handleClick = () => {
        getPlans()
            .then(setSavedPlans)
            .catch((error) => {
                console.error('Failed to load plans:', error);
            });
        setShowPlans(!showPlans);
    };

    const handleClose = () => {
        setShowPlans(false);
    };

    const handleDelete = (planId) => {
        deletePlan(planId)
            .then(() => {
                return getPlans();
            })
            .then(setSavedPlans)
            .catch((error) => {
                console.error('Failed to delete plan:', error);
                alert('Failed to delete plan. Please try again.');
            });
    };

    return (
        <>
            <button className="plan-action-button" onClick={handleClick}>
                <svg 
                    className="plan-action-button-icon" 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Browse Plans
            </button>
            
            {showPlans && (
                <PlansPopUp 
                    savedPlans={savedPlans} 
                    handleLoadScreen={handleLoadScreen}
                    onClose={handleClose} 
                    handleDelete={handleDelete}
                    currentPlan={currentPlan}
                />
            )}
        </>
    );
};