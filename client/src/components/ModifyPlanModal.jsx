import { useState, useEffect } from "react";
import "../styles/PlanSetupModal.css";

export function ModifyPlanModal({ 
    plan, 
    onSave, 
    onClose, 
    categorizedClasses,
    currentCompletedClasses,
    droppableZones,
    allClasses = [],
    requirementGroups = [],
    initialGeSelections = new Set(),
    onGeSelectionsChange,
}) {
    const [planName, setPlanName] = useState(plan?.name || "");
    const [nameError, setNameError] = useState("");
    const [allCatalogClasses, setAllCatalogClasses] = useState([]);
    const [completedClassesList, setCompletedClassesList] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [search, setSearch] = useState("");
    const [completedClasses, setCompletedClasses] = useState(() => {
        if (currentCompletedClasses && currentCompletedClasses.size > 0) {
            return new Set(Array.from(currentCompletedClasses).map(id => String(id)));
        }
        return new Set();
    });

    const [selectedGeRequirements, setSelectedGeRequirements] = useState(new Set(initialGeSelections));

    // Update completed classes when currentCompletedClasses changes (including when modal opens)
    useEffect(() => {
        if (currentCompletedClasses) {
            // Convert all IDs to strings for consistent comparison
            const completedIds = Array.from(currentCompletedClasses).map(id => String(id));
            setCompletedClasses(new Set(completedIds));
        } else {
            setCompletedClasses(new Set());
        }
    }, [currentCompletedClasses]);

    useEffect(() => {
        // Derive Prep catalog from requirementGroups + allClasses
        let catalog = [];

        if (allClasses && allClasses.length > 0 && requirementGroups && requirementGroups.length > 0) {
            const prepIds = new Set();
            requirementGroups
                .filter(group => (group.type || '').toLowerCase() === 'prep')
                .forEach(group => {
                    (group.requirements || []).forEach(req => {
                        (req.fulfilledByClassIds || []).forEach(id => {
                            prepIds.add(String(id));
                        });
                    });
                });

            catalog = allClasses.filter(course => prepIds.has(String(course.id)));
        } else {
            // Fallback: use categorizedClasses['Prep'] if available
            const prepFromCategories = (categorizedClasses && categorizedClasses['Prep']) || [];
            catalog = prepFromCategories;
        }

        if (catalog && catalog.length > 0) {
            setAllCatalogClasses(catalog);

            // Get all class IDs that are in the plan grid (not quarter 0)
            const classesInPlan = new Set();
            for (let row = 1; row <= 4; row++) {
                for (let col = 1; col <= 4; col++) {
                    const zoneId = `zone-${row}-${col}`;
                    const zone = droppableZones?.[zoneId];
                    if (zone && zone.items) {
                        zone.items.forEach(item => {
                            classesInPlan.add(String(item.id));
                        });
                    }
                }
            }
            
            // Separate completed classes (quarter 0) from available classes
            const completed = [];
            const available = [];
            
            catalog.forEach(course => {
                const courseId = String(course.id);
                if (completedClasses.has(courseId)) {
                    completed.push(course);
                } else if (!classesInPlan.has(courseId)) {
                    // Only include classes that are NOT in the plan grid
                    available.push(course);
                }
            });
            
            setCompletedClassesList(completed);
            setAvailableClasses(available);
        }
    }, [categorizedClasses, droppableZones, completedClasses, allClasses]);

    const filteredCompleted = completedClassesList;
    const filteredAvailable = availableClasses;

    const formatRequirementName = (name) => {
        if (!name) return '';
        const parts = name.split(' - ');
        return parts[parts.length - 1];
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
            if (onGeSelectionsChange) {
                onGeSelectionsChange(next);
            }
            return next;
        });
    };

    const getGeCompletedClassIds = () => {
        if (!requirementGroups || !requirementGroups.length) return [];
        const picked = new Set();

        requirementGroups.forEach(group => {
            if ((group.type || '').toLowerCase() !== 'ge') return;
            (group.requirements || []).forEach(req => {
                if (!selectedGeRequirements.has(req.id)) return;
                const options = req.fulfilledByClassIds || [];
                for (const cid of options) {
                    if (!picked.has(cid)) {
                        picked.add(cid);
                        break;
                    }
                }
            });
        });

        return Array.from(picked);
    };

    const toggleCompleted = (courseId) => {
        setCompletedClasses(prev => {
            const newSet = new Set(prev);
            const idStr = String(courseId);
            if (newSet.has(idStr)) {
                newSet.delete(idStr);
            } else {
                newSet.add(idStr);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        const trimmedName = planName.trim();
        if (!trimmedName) {
            setNameError("Please enter a plan name");
            return;
        }
        const prepIds = Array.from(completedClasses);
        const geIds = getGeCompletedClassIds();
        const combined = Array.from(new Set([...prepIds, ...geIds]));
        onSave(trimmedName, combined);
    };

    return (
        <>
            <div className="setup-backdrop" onClick={onClose} />
            <div className="setup-modal">
                <div className="setup-header compact">
                    <button className="setup-back" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Close
                    </button>
                    <h2>Modify Plan</h2>
                    <p>Edit plan name and completed classes</p>
                </div>

                <div className="setup-name-input-wrapper">
                    <input 
                        type="text" 
                        className={`setup-name-input ${nameError ? 'error' : ''}`}
                        value={planName} 
                        onChange={(e) => {
                            setPlanName(e.target.value);
                            setNameError("");
                        }} 
                        placeholder="Plan Name" 
                        autoFocus
                    />
                    {nameError && <span className="setup-name-error">{nameError}</span>}
                </div>

                {geRequirementItems.length > 0 && (
                    <div className="setup-classes-section">
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
                                            {formatRequirementName(req.name)}
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
                        {/* Show completed classes (quarter 0) at the top */}
                        {filteredCompleted.length > 0 && (
                            <>
                                <div className="setup-classes-section-title">Completed Classes</div>
                                {filteredCompleted.map((course) => (
                                    <button 
                                        key={course.id}
                                        className={`setup-class-item selected`}
                                        onClick={() => toggleCompleted(course.id)}
                                    >
                                        <div className="setup-class-checkbox">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M20 6L9 17l-5-5"/>
                                            </svg>
                                        </div>
                                        <div className="setup-class-info">
                                            <span className="setup-class-code">{course.code}</span>
                                            <span className="setup-class-name">{course.name}</span>
                                        </div>
                                        <span className="setup-class-units">{course.units}u</span>
                                    </button>
                                ))}
                            </>
                        )}
                        
                        {/* Show available classes (not in plan) */}
                        {filteredAvailable.length > 0 && (
                            <>
                                {filteredCompleted.length > 0 && (
                                    <div className="setup-classes-section-title" style={{ marginTop: '1rem' }}>Available Classes</div>
                                )}
                                {filteredAvailable.map((course) => (
                                    <button 
                                        key={course.id}
                                        className={`setup-class-item ${completedClasses.has(String(course.id)) ? 'selected' : ''}`}
                                        onClick={() => toggleCompleted(course.id)}
                                    >
                                        <div className="setup-class-checkbox">
                                            {completedClasses.has(String(course.id)) && (
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
                                ))}
                            </>
                        )}
                        
                        {filteredCompleted.length === 0 && filteredAvailable.length === 0 && (
                            <div className="setup-classes-empty">
                                {search ? "No classes match your search" : "No classes available"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="setup-actions">
                    <button className="setup-primary-btn" onClick={handleSave}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17 21v-8H7v8M7 3v5h8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Save Changes
                    </button>
                </div>
            </div>
        </>
    );
}

