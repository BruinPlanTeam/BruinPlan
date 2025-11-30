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

    const savePlan = async (planName) => {

        const token = localStorage.getItem('token');
        
        // Serialize current state
        const planData = {
            name: planName,
            majorName: major,
            quarters: serializeDroppableZones(droppableZones)
        };
                
        try {
          // Call backend
          const response = await fetch('http://localhost:3000/plans', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
          });
          
          // Check if response is OK before parsing
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error(`Failed to save plan: ${response.status} - ${errorText.substring(0, 100)}`);
          }
          
          return response.json();
        } catch (error) {
          console.error('Save plan error:', error);
          throw error; // Re-throw so calling component can handle it
        }
      };

    const getPlans = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/plans', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }

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
        savePlan,
        getPlans,
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

function serializeDroppableZones(droppableZones, majorName) {
    const quarters = [];
    
    // Loop through all zones
    for (let year = 1; year <= 4; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const zoneId = `zone-${year}-${quarter}`;
        const zone = droppableZones[zoneId];
        
        // Calculate sequential quarter number
        const quarterNumber = (year - 1) * 4 + quarter;
        
        // Extract just the class IDs
        const classIds = zone.items.map(item => parseInt(item.id));
        
        if (classIds.length > 0) {
          quarters.push({
            quarterNumber,
            classIds
          });
        }
      }
    }
    
    return quarters;
  }

  function deserializePlanToZones(planData, allClasses) {
    const zones = initializeEmptyZones(); // Your existing initialization
    
    planData.quarters.forEach(quarter => {
      const year = Math.ceil(quarter.quarterNumber / 4);
      const quarterInYear = ((quarter.quarterNumber - 1) % 4) + 1;
      const zoneId = `zone-${year}-${quarterInYear}`;
      
      // Look up full class objects from IDs
      const classObjects = quarter.planClasses.map(pc => {
        return allClasses.find(c => c.id == pc.classId);
      }).filter(Boolean);
      
      zones[zoneId].items = classObjects;
    });
    
    return zones;
  }