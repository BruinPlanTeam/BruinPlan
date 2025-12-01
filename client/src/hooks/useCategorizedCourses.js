import { useState, useEffect, useCallback } from 'react';
import { getMajorData } from '../services/majorDetailService.js';
/**
 * Map requirement type/name to a display category
 * @param {string} type - The requirement type
 * @param {string} name - The requirement name
 * @returns {string} The category name
 */

/**
 * Custom hook for managing categorized courses
 */
export function useCategorizedCourses(major) {
  const [categorizedClasses, setCategorizedClasses] = useState({
    'Prep': [],
    'Major': [],
    'Tech Breadth': [],
    'Sci-Tech': [],
    'GE': []
  });

  const [requirementGroups, setRequirementGroups] = useState([]);

  useEffect(() =>  {
    async function fetchData(){
      try{
        const data = await getMajorData(major);
        let groups = data.majorRequirementGroups;
        setRequirementGroups(groups);
        categorizeClasses(data.availableClasses, groups);
      } catch(e){
        console.error("Error retrieving majors: ", {major}, e);
      }
    }
    if (!major) return;
      fetchData();
  }, []);

  /**
   * Categorize classes based on requirements
   * @param {Array} allClasses - All available classes
   * @param {Array} allRequirementGroups - All major requirement groups
   */
  const categorizeClasses = useCallback((allClasses, allRequirementGroups) => {
    const categories = {
      'Prep': [],
      'Major': [],
      'Tech Breadth': [],
      'GE': []
    };

    // create a map of classId to requirement group types
    const classToReqType = new Map();
    
    // For each group, map its requirements' classes to the group's type
    allRequirementGroups.forEach(group => {
      const category = group.type || 'Other';
      (group.requirements || []).forEach(req => {
        req.fulfilledByClassIds?.forEach(classId => {
          const key = String(classId);
          if (!classToReqType.has(key)) {
            classToReqType.set(key, category);
          }
        });
      });
    });

    // categorize each class
    allClasses.forEach(cls => {
      const category = classToReqType.get(cls.id) || 'GE';
      if (categories[category]) {
        categories[category].push(cls);
      } else {
        categories['GE'].push(cls);
      }
    });

    setCategorizedClasses(categories);
  }, []);

  /**
   * Add a course back to its appropriate category
   * @param {Object} item - The course item to add back
   * @param {Array} requirementGroups - All major requirement groups
   */
  const addCourseToCategory = useCallback((item, requirementGroups) => {
    setCategorizedClasses(prev => {
      const updated = { ...prev };
      
      // check if already exists
      for (const courseList of Object.values(updated)) {
        if (courseList.some(c => c.id === item.id)) {
          return updated;
        }
      }
      
      // find correct category based on which requirement group the class fulfills
      let correctCategory = 'GE';
      for (const group of requirementGroups) {
        const category = group.type || 'Other';
        for (const req of group.requirements || []) {
          if (req.fulfilledByClassIds?.some(classId => classId == item.id)) {
            correctCategory = category;
          }
        }
      }
      
      // add to correct category
      if (updated[correctCategory]) {
        updated[correctCategory] = [...updated[correctCategory], item];
      } else {
        updated['GE'] = [...updated['GE'], item];
      }
      
      return updated;
    });
  }, []);

  /**
   * Remove a course from all categories
   * @param {string} courseId - The ID of the course to remove
   */
  const removeCourseFromCategories = useCallback((courseId) => {
    console.log("got here with: ", courseId);
    setCategorizedClasses(prev => {
      const updated = { ...prev };
      for (const [category, courseList] of Object.entries(updated)) {
        updated[category] = courseList.filter(c => c.id !== courseId);
      }
      return updated;
    });
  }, []);

  return {
    categorizedClasses,
    addCourseToCategory,
    removeCourseFromCategories,
    requirementGroups
  };
}

