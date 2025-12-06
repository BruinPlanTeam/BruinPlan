import { useState } from 'react';
import "../styles/SavePlanPopUp.css";

export function SavePlanPopUp({ handleSavePlan, currentPlan, onClose }) {
    const [planName, setPlanName] = useState(currentPlan?.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const isEditing = !!currentPlan;

    const handleSave = async () => {
        // if editing, use current plan name, otherwise require name input
        const nameToSave = isEditing ? currentPlan.name : planName.trim();
        
        if (!nameToSave) {
            setError('Please enter a plan name');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await handleSavePlan(nameToSave);
            setPlanName('');
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleSave();
        }
    };

    return (
        <>
            {/* backdrop */}
            <div className="save-plan-backdrop" onClick={onClose} />
            
            {/* modal */}
            <div className="save-plan-modal">
                {/* header */}
                <div className="save-plan-header">
                    <div className="save-plan-title">
                        <svg 
                            className="save-plan-icon" 
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
                            <path 
                                d="M7 3V8H15" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                        <h2>{isEditing ? 'Update Plan' : 'Save New Plan'}</h2>
                    </div>
                    <button className="save-plan-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* content */}
                <div className="save-plan-content">
                    {isEditing ? (
                        <div className="save-plan-info">
                            <p>Saving changes to: <strong>{currentPlan.name}</strong></p>
                        </div>
                    ) : (
                        <label className="save-plan-label">
                            Plan Name
                            <input 
                                type="text" 
                                className="save-plan-input"
                                placeholder="e.g., Fall 2024 CS Plan" 
                                value={planName} 
                                onChange={(e) => setPlanName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                                disabled={loading}
                            />
                        </label>
                    )}
                    
                    {error && (
                        <div className="save-plan-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            {error}
                        </div>
                    )}
                </div>

                {/* footer */}
                <div className="save-plan-footer">
                    <button 
                        className="save-plan-cancel-btn" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        className="save-plan-save-btn" 
                        onClick={handleSave}
                        disabled={loading || (!isEditing && !planName.trim())}
                    >
                        {loading ? (
                            <>
                                <svg className="save-plan-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="3" opacity="0.25"/>
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            isEditing ? 'Update Plan' : 'Save Plan'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}