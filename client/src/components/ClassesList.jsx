import { Droppable } from "./Droppable"

export function ClassesList({ getClassesForContainer}) {
    return (
        <Droppable key="home" id="home" title="Available Classes">
          {getClassesForContainer(null)}
          
          {getClassesForContainer(null).length === 0 && (
            <span>All classes assigned</span>
          )}
        </Droppable>
    );   
}