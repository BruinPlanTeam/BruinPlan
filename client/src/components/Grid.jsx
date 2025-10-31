import { Droppable } from './Droppable'

import '../Major.jsx'
import '../DegreePlan.css'

export function Grid({ droppableZones }) {
    return (
      <div className="droppable-zones-container">
        <h2>4 Year Plan</h2>
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