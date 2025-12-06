import "../styles/PlansPopUp.css";

export function PlansPopUp({ savedPlans, handleLoadScreen, onClose, handleDelete, currentPlan }) {

    const handlePlanClick = (plan) => {
        if (handleLoadScreen) {
            handleLoadScreen(plan);
        }
        onClose();
    };

    return (
        <>
            {/* backdrop */}
            <div className="plans-backdrop" onClick={onClose} />
            
            {/* modal */}
            <div className="plans-modal">
                {/* header */}
                <div className="plans-header">
                    <div className="plans-title">
                        <svg 
                            className="plans-title-icon" 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none"
                        >
                            <path 
                                d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                        <h2>My Saved Plans</h2>
                    </div>
                    <button className="plans-close-button" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* content */}
                <div className="plans-content">
                    {savedPlans.length === 0 ? (
                        <div className="plans-empty">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p className="plans-empty-text">No saved plans yet</p>
                            <p className="plans-empty-subtext">Create a degree plan and save it to see it here</p>
                        </div>
                    ) : (
                        <div className="plans-list">
                            {savedPlans.map((plan) => (
                                <div 
                                    key={plan.id}
                                    className="plan-card"
                                    onClick={() => handlePlanClick(plan)}
                                >
                                    {plan.id !== currentPlan?.id && <button 
                                        className="plan-card-delete-button" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(plan.id);
                                        }}
                                        aria-label="Delete plan"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>}  
                                    <div className="plan-card-header">
                                        <h3 className="plan-card-name">{plan.name}</h3>
                                        <svg 
                                            className="plan-card-arrow" 
                                            width="20" 
                                            height="20" 
                                            viewBox="0 0 24 24" 
                                            fill="none"
                                        >
                                            <path 
                                                d="M9 18L15 12L9 6" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                    <div className="plan-card-details">
                                        <span className="plan-card-major">{plan.major?.name || 'Unknown Major'}</span>
                                        <span className="plan-card-dot">•</span>
                                        <span className="plan-card-date">
                                            {plan.quarters?.length || 0} quarters
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}