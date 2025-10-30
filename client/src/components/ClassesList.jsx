import { Droppable } from "./Droppable"

export function ClassesList({ getClassesForContainer}) {
    return (
        <Droppable key="home" id="home" title="Available Classes">
          {getClassesForContainer(null)}
          
          {/* Show a message if empty */}
          {getClassesForContainer(null).length === 0 && (
            <span className="text-gray-400 text-sm">All classes assigned</span>
          )}
        </Droppable>
    );
    
}