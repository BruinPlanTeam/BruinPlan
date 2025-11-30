import { Droppable } from './Droppable'
import { getCurrentUnits } from '../utils/courseUtils'

import '../providers/Major.jsx'
import '../pages/DegreePlan.css'

const MAX_UNITS = 21;

export function Grid({ droppableZones, electricCourseId }) {
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
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
}