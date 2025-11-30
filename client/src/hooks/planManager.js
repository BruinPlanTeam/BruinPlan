import { useState, useEffect, useRef } from 'react'; // Import these
import { useMajor } from "../providers/Major";
import { useCategorizedCourses } from "./useCategorizedCourses";
import { useDragAndDrop } from "./useDragAndDrop";
import { useCourseValidation } from "./useCourseValidation";

export function usePlanManager() {
    const { major, setMajor } = useMajor(); 

    const isLoadingPlan = useRef(false);

    const { 
        categorizedClasses, 
        addCourseToCategory, 
        removeCourseFromCategories,
        requirements,
        fetchData 
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

    const loadPlan = (droppableZonesData, newMajor) => {
        // TODO: Im not sure how the data is stored, will change how I handle populating the side bar
        isLoadingPlan.current = true;

        if (newMajor && newMajor !== major) {
            setMajor(newMajor); 
        }

        setDroppableZones(droppableZonesData);
    }

    useEffect(() => {
        if (isLoadingPlan.current) { 
            if (categorizedClasses) {     
                const idsToRemove = [];
        
                for (let row = 1; row <= 4; row++) {
                    for (let col = 1; col <= 4; col++) {
                        const zoneId = `zone-${row}-${col}`;
                        const zone = droppableZones[zoneId];
                        
                        if (zone && zone.items) {
                            for (const item of zone.items) {
                                idsToRemove.push(String(item.id));
                            }
                        }
                    }
                }
            
                idsToRemove.forEach(id => removeCourseFromCategories(id));   
                isLoadingPlan.current = false;
            }
        }
    }, [droppableZones, categorizedClasses, major]); 

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