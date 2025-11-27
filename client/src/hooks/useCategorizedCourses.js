import { useState, useCallback } from 'react';

/**
 * Map requirement type/name to a display category
 * @param {string} type - The requirement type
 * @param {string} name - The requirement name
 * @returns {string} The category name
 */
function mapTypeToCategory(type, name) {
  const nameLower = name.toLowerCase();
  const typeLower = type.toLowerCase();

  if (nameLower.includes('preparation') || nameLower.includes('prep')) {
    return 'Preparation';
  }
  if (nameLower.includes('tech') && nameLower.includes('breadth')) {
    return 'Tech Breadth';
  }
  if (typeLower.includes('ge') || nameLower.includes('general education')) {
    return 'GE';
  }
  if (typeLower.includes('lower') || typeLower.includes('upper') || 
      typeLower.includes('major') || typeLower.includes('required')) {
    return 'Major';
  }
  
  return 'GE';
}

/**
 * Custom hook for managing categorized courses
 */
export function useCategorizedCourses() {
  const [categorizedClasses, setCategorizedClasses] = useState({
    'Preparation': [],
    'Major': [],
    'Tech Breadth': [],
    'Sci-Tech': [],
    'GE': []
  });

  /**
   * Categorize classes based on requirements
   * @param {Array} allClasses - All available classes
   * @param {Array} allRequirements - All major requirements
   */
  const categorizeClasses = useCallback((allClasses, allRequirements) => {
    const categories = {
      'Preparation': [],
      'Major': [],
      'Tech Breadth': [],
      'GE': []
    };

    // Create a map of classId to requirement types
    const classToReqType = new Map();
    
    allRequirements.forEach(req => {
      const type = req.type || 'Other';
      const category = mapTypeToCategory(type, req.name);
      
      req.fulfilledByClassIds?.forEach(classId => {
        if (!classToReqType.has(classId)) {
          classToReqType.set(classId, category);
        }
      });
    });

    // Categorize each class
    allClasses.forEach(cls => {
      const category = classToReqType.get(Number(cls.id)) || 'GE';
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
      
      // Check if already exists
      for (const courseList of Object.values(updated)) {
        if (courseList.some(c => c.id === item.id)) {
          return updated;
        }
      }
      
      // Find correct category
      let correctCategory = 'GE';
      for (const req of requirements) {
        if (req.fulfilledByClassIds?.some(classId => classId == item.id)) {
          correctCategory = mapTypeToCategory(req.type, req.name);
          break;
        }
      }
      
      // Add to correct category
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
    setCategorizedClasses,
    categorizeClasses,
    addCourseToCategory,
    removeCourseFromCategories,
    mapTypeToCategory: (type, name) => mapTypeToCategory(type, name) // Export for use in component
  };
}

