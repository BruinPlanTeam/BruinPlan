import "../styles/PlanActionButton.css";

export function ResetPlanButton({ onReset }) {
    const handleClick = () => {
        if (window.confirm('Are you sure you want to reset? This will clear all courses from your plan.')) {
            onReset();
        }
    };

    return (
        <button className="plan-action-button reset" onClick={handleClick}>
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
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
            </svg>
            Reset Plan
        </button>
    );
}

