import React, { useState, useEffect } from 'react';
import './ProgressBar.css';

export function ProgressBar({ requirements, droppableZones }) {
  const [progressByType, setProgressByType] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Create a dependency that changes whenever droppableZones content changes
  const zonesKey = JSON.stringify(
    Object.values(droppableZones).map(zone => zone.items.map(item => item.id))
  );

  useEffect(() => {
    calculateProgress();
  }, [requirements, zonesKey]);

  const calculateProgress = () => {
    if (!requirements || requirements.length === 0) return;

    // Get all scheduled course IDs from the plan
    const scheduledCourseIds = Object.values(droppableZones)
      .flatMap(zone => zone.items.map(item => item.id))
      .filter(Boolean);

    // Group requirements by type
    const typeGroups = {};
    let totalRequired = 0;
    let totalCompleted = 0;

    requirements.forEach(req => {
      const type = req.type || 'Other';

      if (!typeGroups[type]) {
        typeGroups[type] = {
          type,
          requirements: [],
          completed: 0,
          total: 0
        };
      }

      // Check how many courses from this requirement are scheduled
      const requiredCourses = req.fulfilledByClassIds || [];
      const scheduledFromReq = requiredCourses.filter(courseId => 
        scheduledCourseIds.some(id => id == courseId)
      );

      const coursesToChoose = req.coursesToChoose || 1;
      const completed = Math.min(scheduledFromReq.length, coursesToChoose);
      const isComplete = completed >= coursesToChoose;

      typeGroups[type].requirements.push({
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
        {Object.values(progressByType).map(group => {
          const percentage = group.total > 0 ? (group.completed / group.total) * 100 : 0;
          const isExpanded = expandedGroups[group.type];
          
          return (
            <div key={group.type} className="progress-group">
              <div 
                className="group-header clickable"
                onClick={() => toggleGroup(group.type)}
              >
                <div className="group-title">
                  <span className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                  <span className="group-name">{group.type}</span>
                  <span className="group-stats">
                    {group.completed}/{group.total}
                  </span>
                </div>
                <div className="progress-track">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: getTypeColor(group.type)
                    }}
                  />
                </div>
              </div>

              {/* Individual Requirements Dropdown */}
              {isExpanded && (
                <div className="requirements-dropdown">
                  {group.requirements.map((req, index) => {
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
                              backgroundColor: getTypeColor(group.type)
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

