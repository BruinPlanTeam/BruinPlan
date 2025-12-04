import React from 'react';
import { Droppable } from './Droppable.jsx'; 
import { getCurrentUnits } from '../utils/courseUtils.js'; 
import '../styles/DegreePlan.css'; 

const MAX_UNITS = 21;
const MAX_ROWS = 4;
const MAX_COLS = 4;
const QUARTERS = { 1: 'Fall', 2: 'Winter', 3: 'Spring', 4: 'Summer' };


export default function PlanGrid({ droppableZones, electricCourseId, activeId, requirementGroups = [] }) {

    return (
        <div className="plan-grid">
            {[1, 2, 3, 4].map((year) => (
                <div key={year} className="year-row">
                    <div className="year-label">Year {year}</div>
                    <div className="quarters-row">
                        {[1, 2, 3, 4].map((quarter) => {
                            const zoneId = `zone-${year}-${quarter}`;
                            const zone = droppableZones[zoneId];
                            
                            const units = getCurrentUnits(zoneId, droppableZones); 
                            
                            return (
                                <Droppable
                                    key={zoneId}
                                    id={zoneId}
                                    title={zone.title}
                                    items={zone.items}
                                    units={units}
                                    maxUnits={MAX_UNITS}
                                    electricCourseId={electricCourseId}
                                    requirementGroups={requirementGroups}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}