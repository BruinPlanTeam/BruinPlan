import { Droppable } from "./Droppable";
export function Grid({ containers, getClassesForContainer }) {
    return (
        <div className="flex-grow flex flex-col gap-4">
          {containers.map((containerId) => {
            const classesInContainer = getClassesForContainer(containerId);
            return (
              <Droppable key={containerId} id={containerId} title={containerId}>
                {classesInContainer}
                
                {classesInContainer.length === 0 && (
                  <span className="text-gray-400 text-sm">Drop here</span>
                )}
              </Droppable>
            );
          })}
        </div>
    );
}