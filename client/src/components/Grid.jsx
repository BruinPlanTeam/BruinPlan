import { Droppable } from "./Droppable";
export function Grid({ containers, getClassesForContainer }) {
    return (
        <div>
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