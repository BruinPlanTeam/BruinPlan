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

  const [requirements, setRequirements] = useState([]);

  useEffect(() =>  {
    async function fetchData(){
      try{
        const data = await getMajorData(major);
        setRequirements(data.majorRequirements);
        categorizeClasses(data.availableClasses, data.majorRequirements);
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
   * @param {Array} allRequirements - All major requirements
   */
  const categorizeClasses = useCallback((allClasses, allRequirements) => {
    const categories = {
      'Prep': [],
      'Major': [],
      'Tech Breadth': [],
      'GE': []
    };

    // create a map of classId to requirement types
    const classToReqType = new Map();
    
    allRequirements.forEach(req => {
      const category = req.type;

      req.fulfilledByClassIds?.forEach(classId => {
        if (!classToReqType.has(classId)) {
          classToReqType.set(classId, category);
        }
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
   * @param {Array} requirements - All major requirements
   */
  const addCourseToCategory = useCallback((item, requirements) => {
    setCategorizedClasses(prev => {
      const updated = { ...prev };
      
      // check if already exists
      for (const courseList of Object.values(updated)) {
        if (courseList.some(c => c.id === item.id)) {
          return updated;
        }
      }
      
      // find correct category
      let correctCategory = 'GE';
      for (const req of requirements) {
        if (req.fulfilledByClassIds?.some(classId => classId == item.id)) {
          correctCategory = req.type;
          break;
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
    requirements
  };
}

