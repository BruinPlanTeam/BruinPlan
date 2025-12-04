import React, { useState } from 'react';
import '../styles/ProgressBar.css';
import { useRequirementProgress } from '../hooks/useRequirementProgress';

export function ProgressBar({ requirementGroups, droppableZones, completedClasses, allClassesMap, selectedGeRequirements }) {
  const [progressByType, setProgressByType] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // let the hook do the heavy lifting for requirement progress
  const progress = useRequirementProgress(
    requirementGroups,
    droppableZones,
    completedClasses,
    allClassesMap,
    selectedGeRequirements
  );

  // keep a local copy so we can use existing render code with minimal changes
  React.useEffect(() => {
    setProgressByType(progress.progressByType || {});
    setOverallProgress(progress.overallProgress || 0);
  }, [progress.progressByType, progress.overallProgress]);

  const getTypeColor = () => {
    return '#00d4ff';
  };

  const toggleType = (type) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const toggleRequirementGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };


  return (
    <div className="progress-bar-container">
      <div className="progress-header">
        <h2>Degree Progress</h2>
        <div className="overall-percentage">
          {Math.round(overallProgress)}%
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="progress-section overall-section">
        <div className="progress-track">
          <div 
            className="progress-fill overall-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Progress by Type */}
      <div className="progress-groups">
        {(() => {
          // Define fixed order: Prep, Major, Tech Breadth, GE
          const typeOrder = ['Prep', 'Major', 'Tech Breadth', 'GE'];
          return typeOrder
            .map(type => progressByType[type])
            .filter(Boolean);
        })().map(groupType => {
          const percentage = groupType.total > 0 ? (groupType.completed / groupType.total) * 100 : 0;
          const isTypeExpanded = expandedTypes[groupType.type];
          
          return (
            <div key={groupType.type} className="progress-group">
              <div 
                className="group-header clickable"
                onClick={() => toggleType(groupType.type)}
              >
                <div className="group-title">
                  <span className={`dropdown-arrow ${isTypeExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                  <span className="group-name">{groupType.type}</span>
                  <span className="group-stats">
                    {groupType.completed}/{groupType.total}
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getTypeColor()
                    }}
                  />
                </div>
              </div>

              {/* Requirement Groups Dropdown */}
              {isTypeExpanded && (
                <div className="requirements-dropdown">
                  {groupType.groups.map((grp) => {
                    if (!grp.requirements || grp.requirements.length === 0) return null;

                    const isGroupExpanded = expandedGroups[grp.id];
                    const groupPercentage = grp.groupTotal > 0 ? (grp.groupCompleted / grp.groupTotal) * 100 : 0;

                    // If only one requirement in the group, show just the requirement (no group wrapper)
                    if (grp.requirements.length === 1) {
                      const req = grp.requirements[0];
                      const reqPercentage = req.total > 0 ? (req.completed / req.total) * 100 : 0;
                      return (
                        <div key={grp.id} className="requirement-item">
                          <div className="requirement-header">
                            <span className={`requirement-status ${req.isComplete ? 'complete' : 'incomplete'}`}>
                              {req.isComplete ? '✓' : '○'}
                            </span>
                            <span className="requirement-name">{req.displayName}</span>
                            <span className="requirement-stats">
                              {req.completed}/{req.total}
                            </span>
                          </div>
                          <div className="requirement-progress-track">
                            <div 
                              className="requirement-progress-fill"
                              style={{ 
                                width: `${reqPercentage}%`,
                                backgroundColor: getTypeColor(groupType.type)
                              }}
                            />
                          </div>
                        </div>
                      );
                    }

                    // multiple requirements: show collapsible group
                    return (
                      <div key={grp.id} className="requirement-group-item">
                        <div 
                          className="requirement-group-header clickable"
                          onClick={() => toggleRequirementGroup(grp.id)}
                        >
                          <div className="requirement-header">
                            <span className={`dropdown-arrow small ${isGroupExpanded ? 'expanded' : ''}`}>
                              ▼
                            </span>
                            <span className="requirement-name">{progress.getDisplayName(grp.name)}</span>
                            <span className="requirement-stats">
                              {grp.groupCompleted}/{grp.groupTotal}
                            </span>
                          </div>
                          <div className="requirement-progress-track">
                            <div 
                              className="requirement-progress-fill"
                              style={{ 
                                width: `${groupPercentage}%`,
                                backgroundColor: getTypeColor(groupType.type)
                              }}
                            />
                          </div>
                        </div>
                        {isGroupExpanded && (
                          <div className="nested-requirements">
                            {grp.requirements.map((req) => {
                              const reqPercentage = req.total > 0 ? (req.completed / req.total) * 100 : 0;
                              return (
                                <div key={req.id} className="requirement-item nested">
                                  <div className="requirement-header">
                                    <span className={`requirement-status ${req.isComplete ? 'complete' : 'incomplete'}`}>
                                      {req.isComplete ? '✓' : '○'}
                                    </span>
                                    <span className="requirement-name">{req.displayName}</span>
                                    <span className="requirement-stats">
                                      {req.completed}/{req.total}
                                    </span>
                                  </div>
                                  <div className="requirement-progress-track">
                                    <div 
                                      className="requirement-progress-fill"
                                      style={{ 
                                        width: `${reqPercentage}%`,
                                        backgroundColor: getTypeColor(groupType.type)
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {Object.keys(progressByType).length === 0 && (
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;

