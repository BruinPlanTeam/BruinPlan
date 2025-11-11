import { Droppable } from './Droppable'

import '../Major.jsx'
import '../DegreePlan.css'

export function Grid({ droppableZones }) {
    return (
      <div className="droppable-zones-container">
        <div className="zones-grid">
          {Object.values(droppableZones).map((zone) => (
            <Droppable
              key={zone.id}
              id={zone.id}
              title={zone.title}
              items={zone.items}
            />
          ))}
        </div>
      </div>
    );
}