import { useState, useEffect, useCallback } from 'react';
import { getMajorData } from '../services/majorDetailService.js';

const CATEGORY_PRIORITY = ['Prep', 'Major', 'Tech Breadth', 'Sci-Tech', 'GE'];

export function useCategorizedCourses(major) {
  const [categorizedClasses, setCategorizedClasses] = useState({
    'Prep': [],
    'Major': [],
    'Tech Breadth': [],
    'Sci-Tech': [],
    'GE': []
  });

  const [requirementGroups, setRequirementGroups] = useState([]);

  const determinePreferredCategory = useCallback((categorySet, availableCategories) => {
    if (!categorySet || categorySet.size === 0) return null;
    for (const priority of CATEGORY_PRIORITY) {
      if (categorySet.has(priority) && availableCategories[priority]) {
        return priority;
      }
    }
    return null;
  }, []);

  const categorizeClasses = useCallback((allClasses, allRequirementGroups) => {
    const isCS = major === 'Computer Science';
    const categories = {
      'Prep': [],
      'Major': [],
      'Tech Breadth': [],
      ...(isCS ? { 'Sci-Tech': [] } : {}),
      'GE': []
    };

    const classToCategories = new Map();
    
    allRequirementGroups.forEach(group => {
      let category = group.type;
      const groupName = group.name || '';
      
      // For CS, map Sci-Tech requirement group to Sci-Tech category in sidebar
      if (isCS && groupName.includes('Sci-tech')) {
        category = 'Sci-Tech';
      } else if (!categories[category]) {
        category = 'GE';
      }
      
      (group.requirements || []).forEach(req => {
        req.fulfilledByClassIds?.forEach(classId => {
          const key = String(classId);
          if (!classToCategories.has(key)) {
            classToCategories.set(key, new Set());
          }
          classToCategories.get(key).add(category);
        });
      });
    });

    allClasses.forEach(cls => {
      const preferred = determinePreferredCategory(classToCategories.get(String(cls.id)), categories);
      const finalCategory = preferred || 'GE';
      categories[finalCategory].push(cls);
    });

    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.code.localeCompare(b.code));
    });

    setCategorizedClasses(categories);
  }, [major, determinePreferredCategory]);

  useEffect(() =>  {
    async function fetchData(){
      try{
        const data = await getMajorData(major);
        const groups = data.majorRequirementGroups;
        setRequirementGroups(groups);
        categorizeClasses(data.availableClasses, groups);
      } catch(e){
        console.error("Error retrieving majors: ", {major}, e);
      }
    }
    if (!major) return;
    fetchData();
  }, [major, categorizeClasses]);

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
      
      const isCS = major === 'Computer Science';
      const matchingCategories = new Set();
      for (const group of requirementGroups) {
        let category = group.type;
        const groupName = group.name;
        
        // For CS, map Sci-Tech requirement group to Sci-Tech category
        if (isCS && groupName.includes('Sci-tech')) {
          category = 'Sci-Tech';
        } else if (!updated[category]) {
          category = 'GE';
        }
        
        for (const req of group.requirements || []) {
          if (req.fulfilledByClassIds?.some(classId => classId == item.id)) {
            matchingCategories.add(category);
            break;
          }
        }
      }
      
      const preferred = determinePreferredCategory(matchingCategories, updated) || 'GE';
      updated[preferred] = [...updated[preferred], item].sort((a, b) => a.code.localeCompare(b.code));
      
      return updated;
    });
  }, [major, determinePreferredCategory]);

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
    addCourseToCategory,
    removeCourseFromCategories,
    requirementGroups
  };
}

