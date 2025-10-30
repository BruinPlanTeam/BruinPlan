import { Droppable } from "./Droppable";
import { ClassesList } from './ClassesList';

export function Grid({ containers, getClassesForContainer }) {
    return (
        <div>
          <ClassesList getClassesForContainer={getClassesForContainer} />
          {containers.map((containerId) => {
            const classesInContainer = getClassesForContainer(containerId);
            return (
              <Droppable key={containerId} id={containerId} title={containerId}>
                {classesInContainer}
                {classesInContainer.length === 0 && (
                  <span>Drop here</span>
                )}
              </Droppable>
            );
          })}
        </div>
    );
}