import { useMajor } from "../providers/Major";
import { useCategorizedCourses } from "./useCategorizedCourses";
import { useDragAndDrop } from "./useDragAndDrop";
import { useCourseValidation } from "./useCourseValidation";


export function usePlanManager() {
    const { major } = useMajor();

    const { 
        categorizedClasses, 
        addCourseToCategory, 
        removeCourseFromCategories,
        requirements 
    } = useCategorizedCourses(major);

    const {
        droppableZones,
        setDroppableZones,
        activeId,
        activeItem,
        electricCourseId,
        handleDragStart,
        handleDragOver,
        createHandleDragEnd,
    } = useDragAndDrop(
        categorizedClasses, 
        addCourseToCategory, 
        removeCourseFromCategories, 
        requirements 
    );

    const { arePrereqsCompleted } = useCourseValidation(droppableZones);

    const loadPlan = (droppableZonesData) => {
        setDroppableZones(droppableZonesData);
        
        const idsToRemove = [];
    
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
              const zoneId = `zone-${row}-${col}`;
              
              if (droppableZonesData[zoneId]) {
                  for (const item of droppableZonesData[zoneId].items) {
                    idsToRemove.push(String(item.id));
                  }
              }
            }
        }
    
        idsToRemove.forEach(id => removeCourseFromCategories(id));
    }

    return {
        major,
        loadPlan,
        categorizedClasses, 
        requirements,
        droppableZones,
        setDroppableZones,
        activeId,
        activeItem,
        electricCourseId,
        handleDragStart,
        handleDragOver,
        createHandleDragEnd,
        arePrereqsCompleted
    }   
}