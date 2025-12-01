import React, { useState, useEffect } from 'react';
import '../styles/ProgressBar.css';

export function ProgressBar({ requirementGroups, droppableZones }) {
  const [progressByType, setProgressByType] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState({});

  // create a dependency that changes whenever droppableZones content changes
  const zonesKey = JSON.stringify(
    Object.values(droppableZones).map(zone => zone.items.map(item => item.id))
  );

  useEffect(() => {
    calculateProgress();
  }, [requirementGroups, zonesKey]);

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
        requirements: [],
      };

      (group.requirements || []).forEach(req => {
        const requiredCourses = req.fulfilledByClassIds || [];
        const scheduledFromReq = requiredCourses.filter(courseId => 
          scheduledCourseIds.some(id => id == courseId)
        );

        const coursesToChoose = req.coursesToChoose || 1;
        const completed = Math.min(scheduledFromReq.length, coursesToChoose);
        const isComplete = completed >= coursesToChoose;

        groupEntry.requirements.push({
          name: req.name,
          completed,
          total: coursesToChoose,
          isComplete
        });

        typeGroups[type].completed += completed;
        typeGroups[type].total += coursesToChoose;

        totalRequired += coursesToChoose;
        totalCompleted += completed;
      });

      typeGroups[type].groups.push(groupEntry);
    });

    console.log("typeGroups: ", typeGroups) 

    setProgressByType(typeGroups);
    setOverallProgress(totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0);
  };

  const getTypeColor = (type) => {
    const colors = {
      'Prep': '#4fc3f7',
      'Major': '#9c27b0',
      'GE': '#7986cb'
    };
    return colors[type] || '#64ffda';
  };

  const toggleGroup = (type) => {
    setExpandedGroups(prev => ({
      ...prev,
      [type]: !prev[type]
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
        {Object.values(progressByType).map(groupType => {
          const percentage = groupType.total > 0 ? (groupType.completed / groupType.total) * 100 : 0;
          const isExpanded = expandedGroups[groupType.type];
          
          return (
            <div key={groupType.type} className="progress-group">
              <div 
                className="group-header clickable"
                onClick={() => toggleGroup(groupType.type)}
              >
                <div className="group-title">
                  <span className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
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
                      backgroundColor: getTypeColor(groupType.type)
                    }}
                  />
                </div>
              </div>

              {/* Individual Requirement Groups / Requirements Dropdown */}
              {isExpanded && (
                <div className="requirements-dropdown">
                  {groupType.groups.map((grp, index) => {
                    if (!grp.requirements || grp.requirements.length === 0) return null;

                    // If only one requirement in the group, show just the requirement
                    if (grp.requirements.length === 1) {
                      const req = grp.requirements[0];
                      const reqPercentage = req.total > 0 ? (req.completed / req.total) * 100 : 0;
                      return (
                        <div key={index} className="requirement-item">
                          <div className="requirement-header">
                            <span className={`requirement-status ${req.isComplete ? 'complete' : 'incomplete'}`}>
                              {req.isComplete ? '✓' : '○'}
                            </span>
                            <span className="requirement-name">{req.name}</span>
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

                    // Otherwise, render group header with nested requirements
                    const groupCompleted = grp.requirements.reduce((sum, r) => sum + r.completed, 0);
                    const groupTotal = grp.requirements.reduce((sum, r) => sum + r.total, 0);
                    const groupPercentage = groupTotal > 0 ? (groupCompleted / groupTotal) * 100 : 0;

                    return (
                      <div key={index} className="requirement-group-item">
                        <div className="requirement-header">
                          <span className="requirement-name">{grp.name}</span>
                          <span className="requirement-stats">
                            {groupCompleted}/{groupTotal}
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
                        {grp.requirements.map((req, rIndex) => {
                          const reqPercentage = req.total > 0 ? (req.completed / req.total) * 100 : 0;
                          return (
                            <div key={rIndex} className="requirement-item nested">
                              <div className="requirement-header">
                                <span className={`requirement-status ${req.isComplete ? 'complete' : 'incomplete'}`}>
                                  {req.isComplete ? '✓' : '○'}
                                </span>
                                <span className="requirement-name">{req.name}</span>
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
          <p>No requirements loaded yet</p>
          <p className="empty-hint">Start adding courses to see your progress</p>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;

