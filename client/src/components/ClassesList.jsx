import { Droppable } from "./Droppable"

export function ClassesList({ getClassesForContainer}) {
    return (
        <Droppable key="home" id="home" title="Available Classes">
          {getClassesForContainer("home")}
          
          {getClassesForContainer("home").length === 0 && (
            <span>All classes assigned</span>
          )}
        </Droppable>
    );   
}