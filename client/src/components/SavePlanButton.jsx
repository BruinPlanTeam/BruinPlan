import { useState } from 'react';
import { SavePlanPopUp } from './SavePlanPopUp';
import "../styles/PlanActionButton.css";

export function SavePlanButton({ handleSavePlan, currentPlan }) {
    const [showPopup, setShowPopup] = useState(false);

    return (
        <>    
            <button className="plan-action-button" onClick={() => setShowPopup(true)}>
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
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                </svg>
                {currentPlan ? 'Save Plan' : 'Save Plan'}
            </button>
            
            {showPopup && (
                <SavePlanPopUp 
                    handleSavePlan={handleSavePlan}
                    currentPlan={currentPlan}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </>
    );
}