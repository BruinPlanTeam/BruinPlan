import React, { useState, useEffect } from 'react';
import '../styles/ProgressBar.css';

export function ProgressBar({ requirementGroups, droppableZones }) {
  const [progressByType, setProgressByType] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  // create a dependency that changes whenever droppableZones content changes
  const zonesKey = JSON.stringify(
    Object.values(droppableZones).map(zone => zone.items.map(item => item.id))
  );

  useEffect(() => {
    calculateProgress();
  }, [requirementGroups, zonesKey]);

  // Extract last part of requirement name (after " - ")
  const getDisplayName = (name) => {
    if (!name) return '';
    const parts = name.split(' - ');
    return parts.length > 1 ? parts[parts.length - 1] : name;
  };

  const calculateProgress = () => {
    if (!requirementGroups || requirementGroups.length === 0) return;

    // get all scheduled course ids from the plan
    const scheduledCourseIds = Object.values(droppableZones)
      .flatMap(zone => zone.items.map(item => item.id))
      .filter(Boolean);

    // group requirement groups by type
    const typeGroups = {};
    let totalRequired = 0;
    let totalCompleted = 0;

    requirementGroups.forEach(group => {
      const type = group.type || 'Other';

      if (!typeGroups[type]) {
        typeGroups[type] = {
          type,
          groups: [],
          completed: 0,
          total: 0
        };
      }

      const groupEntry = {
        id: group.id,
        name: group.name,
        numRequirementsToChoose: group.numRequirementsToChoose || 1,
        requirements: [],
        completed: 0,
        total: 0
      };

      // Calculate progress for each requirement
      (group.requirements || []).forEach(req => {
        const requiredCourses = req.fulfilledByClassIds || [];
        const scheduledFromReq = requiredCourses.filter(courseId => 
          scheduledCourseIds.some(id => id == courseId)
        );

        const coursesToChoose = req.coursesToChoose || 1;
        const completed = Math.min(scheduledFromReq.length, coursesToChoose);
        const isComplete = completed >= coursesToChoose;

        groupEntry.requirements.push({
          id: req.id,
          name: req.name,
          displayName: getDisplayName(req.name),
          completed,
          total: coursesToChoose,
          isComplete
        });
      });

      // For requirement group totals:
      // Track how many REQUIREMENTS are completed, not classes
      // The total is numRequirementsToChoose (how many requirements must be met)
      const numCompletedRequirements = groupEntry.requirements.filter(req => req.isComplete).length;
      const numRequirementsToChoose = groupEntry.numRequirementsToChoose;
      
      // For single requirement groups, show the requirement's progress
      if (groupEntry.requirements.length === 1) {
        const req = groupEntry.requirements[0];
        // Group level: show requirement progress (for display)
        groupEntry.groupCompleted = req.completed;
        groupEntry.groupTotal = req.total;
        // Type level: track courses
        typeGroups[type].completed += req.completed;
        typeGroups[type].total += req.total;
        totalRequired += req.total;
        totalCompleted += req.completed;
      } else {
        // For multi-requirement groups, track requirements met for display
        const groupCompleted = Math.min(numCompletedRequirements, numRequirementsToChoose);
        const groupTotal = numRequirementsToChoose;
        groupEntry.groupCompleted = groupCompleted;
        groupEntry.groupTotal = groupTotal;
        
        // For type-level totals: numRequirementsToChoose * coursesToChoose from first req
        const coursesPerRequirement = groupEntry.requirements[0]?.total || 1;
        const totalCoursesRequired = numRequirementsToChoose * coursesPerRequirement;
        
        // Calculate completed courses: count courses from completed requirements only
        const completedCourses = groupEntry.requirements
          .filter(req => req.isComplete)
          .reduce((sum, req) => sum + req.completed, 0);
        // Cap at total required
        const completedCoursesCapped = Math.min(completedCourses, totalCoursesRequired);
        
        typeGroups[type].completed += completedCoursesCapped;
        typeGroups[type].total += totalCoursesRequired;
        totalRequired += totalCoursesRequired;
        totalCompleted += completedCoursesCapped;
      }

      typeGroups[type].groups.push(groupEntry);
    });

    setProgressByType(typeGroups);
    setOverallProgress(totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0);
  };

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

                    // Multiple requirements: show collapsible group
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
                            <span className="requirement-name">{getDisplayName(grp.name)}</span>
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

