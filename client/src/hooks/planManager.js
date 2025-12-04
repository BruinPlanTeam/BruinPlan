import { useState, useEffect, useRef } from 'react'; // import these
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
        requirementGroups,
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
        requirementGroups 
    );

    const { arePrereqsCompleted } = useCourseValidation(droppableZones);

    const savePlan = async (planName, planId = null) => {
        const token = localStorage.getItem('token');
        
        // serialize current state
        const planData = {
            name: planName,
            majorName: major,
            quarters: serializeDroppableZones(droppableZones)
        };
        
        const isUpdate = planId !== null;
        const url = isUpdate 
            ? `http://localhost:3000/plans/${planId}` 
            : 'http://localhost:3000/plans';
        const method = isUpdate ? 'PUT' : 'POST';
        
        console.log(`${isUpdate ? 'Updating' : 'Creating'} plan with data:`, {
            planId,
            planName,
            major,
            quartersLength: planData.quarters?.length
        });
                
        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', response.status, errorText);
            throw new Error(`Failed to ${isUpdate ? 'update' : 'save'} plan: ${response.status} - ${errorText.substring(0, 100)}`);
          }
          
          return response.json();
        } catch (error) {
          console.error(`${isUpdate ? 'Update' : 'Save'} plan error:`, error);
          throw error;
        }
      };

    const getPlans = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:3000/plans', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // check if response is ok before parsing
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                throw new Error(`Failed to load plans: ${response.status} - ${errorText.substring(0, 100)}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('Get plans error:', error);
            throw error; // Re-throw so calling component can handle it
        }
    }

    const loadPlan = (planData) => {
        console.log("Loading plan: ", planData);
        isLoadingPlan.current = true;

        // set major if it's different from current
        if (planData.major && planData.major.name !== major) {
            setMajor(planData.major.name); 
        }

        // deserialize plan data to droppable zones format
        const newZones = deserializePlanToZones(planData);
        setDroppableZones(newZones);
    }

    const deletePlan = async (planId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', response.status, errorText);
                throw new Error(`Failed to delete plan: ${response.status} - ${errorText.substring(0, 100)}`);
            }
            return response.json();
        } catch (error) {
            console.error('Delete plan error:', error);
            throw error; // Re-throw so calling component can handle it
        }
    }

    const resetPlan = () => {
        // Collect all courses currently in the grid
        const coursesToRestore = [];
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                const zoneId = `zone-${row}-${col}`;
                const zone = droppableZones[zoneId];
                if (zone && zone.items) {
                    coursesToRestore.push(...zone.items);
                }
            }
        }

        // Create empty zones
        const emptyZones = {};
        const quarterTitles = ['Fall', 'Winter', 'Spring', 'Summer'];
        for (let row = 1; row <= 4; row++) {
            for (let col = 1; col <= 4; col++) {
                const zoneId = `zone-${row}-${col}`;
                emptyZones[zoneId] = {
                    id: zoneId,
                    title: quarterTitles[col - 1],
                    items: []
                };
            }
        }

        // Set empty zones
        setDroppableZones(emptyZones);

        // Add courses back to their categories
        coursesToRestore.forEach(course => {
            addCourseToCategory(course);
        });
    };

    useEffect(() => {
        if (!isLoadingPlan.current) return;
        if (!categorizedClasses) return;

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
    }, [droppableZones, categorizedClasses]);

    const updatePlanName = async (planId, newName) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:3000/plans/${planId}/name`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });
            if (!response.ok) {
                throw new Error('Failed to update plan name');
            }
            return await response.json();
        } catch (error) {
            console.error('Update plan name error:', error);
            throw error;
        }
    };

    return {
        major,
        savePlan,
        getPlans,
        loadPlan,
        deletePlan,
        resetPlan,
        updatePlanName,
        categorizedClasses, 
        requirementGroups,
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
    
    // loop through all zones
    for (let year = 1; year <= 4; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const zoneId = `zone-${year}-${quarter}`;
        const zone = droppableZones[zoneId];
        
        // calculate sequential quarter number
        const quarterNumber = (year - 1) * 4 + quarter;
        
        // extract just the class ids
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

  function deserializePlanToZones(planData) {
    // initialize empty zones structure
    const zones = {};
    const quarterTitles = ['Fall', 'Winter', 'Spring', 'Summer'];
    
    for (let year = 1; year <= 4; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const zoneId = `zone-${year}-${quarter}`;
        zones[zoneId] = {
          id: zoneId,
          title: quarterTitles[quarter - 1],
          items: []
        };
      }
    }
    
    // fill zones with classes from planData
    if (planData.quarters && Array.isArray(planData.quarters)) {
      planData.quarters.forEach(quarter => {
        // convert quarterNumber back to zone coordinates
        const year = Math.ceil(quarter.quarterNumber / 4);
        const quarterInYear = ((quarter.quarterNumber - 1) % 4) + 1;
        const zoneId = `zone-${year}-${quarterInYear}`;
        
        // map planClasses to zone items
        if (quarter.planClasses && Array.isArray(quarter.planClasses)) {
          zones[zoneId].items = quarter.planClasses.map(pc => ({
            id: String(pc.class.id),
            code: pc.class.code,
            units: pc.class.units,
            description: pc.class.description,
            prereqGroups: []
          }));
        }
      });
    }
    
    return zones;
  }