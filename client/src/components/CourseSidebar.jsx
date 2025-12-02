import React, { useState } from 'react';
import { Droppable } from './Droppable.jsx'; 
import { Draggable } from './ui/Draggable.jsx'; 
import '../styles/CourseSidebar.css'; 


function CourseSidebar({ categorizedClasses, electricCourseId }) {
  const [expandedCategories, setExpandedCategories] = useState({
    'Prep': true,
    'Major': false,
    'Tech Breadth': false,
    'Sci-Tech': false,
    'GE': false
  });
  
  const [searchOpen, setSearchOpen] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  
  const totalCourseCount = Object.values(categorizedClasses).flat().length;

  const toggleCategory = (category) => {
    const newExpanded = !expandedCategories[category];
    setExpandedCategories(prev => ({
      ...prev,
      [category]: newExpanded
    }));
    // Close search when category is collapsed
    if (!newExpanded) {
      setSearchOpen(prev => ({
        ...prev,
        [category]: false
      }));
    }
  };

  const toggleSearch = (category) => {
    const newSearchOpen = !searchOpen[category];
    setSearchOpen(prev => ({
      ...prev,
      [category]: newSearchOpen
    }));
    // Expand category when search is opened
    if (newSearchOpen && !expandedCategories[category]) {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: true
      }));
    }
    if (!newSearchOpen) {
      setSearchTerms(prev => ({ ...prev, [category]: '' }));
    } else {
      setSearchTerms(prev => ({ ...prev, [category]: '' }));
    }
  };

  const handleSearchChange = (category, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const filterCourses = (courses, searchTerm) => {
    if (!searchTerm) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(course => 
      course.code.toLowerCase().includes(term) ||
      (course.description && course.description.toLowerCase().includes(term))
    );
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Available Courses</h2>
        <span className="course-count">{totalCourseCount}</span>
      </div>
      
      {totalCourseCount === 0 ? (
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="course-categories">
          {Object.entries(categorizedClasses).map(([category, courseList]) => {
            if (courseList.length === 0) return null;
            
            const isExpanded = expandedCategories[category] || false;
            const isSearchOpen = searchOpen[category] || false;
            const searchTerm = searchTerms[category] || '';
            
            // Sort courses by ID first
            const sortedCourses = [...courseList].sort((a, b) => {
              const idA = parseInt(a.id, 10);
              const idB = parseInt(b.id, 10);
              return idA - idB;
            });
            
            // Only filter if search is open and has a term
            const filteredCourses = isSearchOpen && searchTerm 
              ? filterCourses(sortedCourses, searchTerm) 
              : sortedCourses;

            return (
              <div key={category} className="course-category">
                <div className="category-header">
                  <div className="category-title-row">
                    <button 
                      className="category-toggle"
                      onClick={() => toggleCategory(category)}
                      aria-label={`Toggle ${category}`}
                    >
                      <span className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
                        ▼
                      </span>
                      <h3>{category}</h3>
                    </button>
                    <button
                      className="search-icon-button"
                      onClick={() => toggleSearch(category)}
                      aria-label={`Search ${category}`}
                    />
                  </div>
                  <span className="category-count">{courseList.length}</span>
                </div>
                
                {isSearchOpen && (
                  <div className="category-search-container">
                    <input
                      type="text"
                      className="category-search-input"
                      placeholder={`Search ${category}...`}
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(category, e.target.value)}
                      autoFocus
                    />
                  </div>
                )}

                {isExpanded && (
                  <Droppable
                    id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    title=""
                    items={filteredCourses}
                    electricCourseId={electricCourseId}
                  >
                    {filteredCourses.length === 0 ? (
                      <div className="no-classes-found">
                        No classes found
                      </div>
                    ) : (
                      filteredCourses.map((item) => (
                        <Draggable 
                          key={item.id} 
                          id={item.id} 
                          item={item} 
                          showElectric={String(item.id) === electricCourseId}
                        >
                          <span className="course-code">{item.code}</span>
                          <span className="course-units">{item.units}u</span>
                        </Draggable>
                      ))
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default React.memo(CourseSidebar);