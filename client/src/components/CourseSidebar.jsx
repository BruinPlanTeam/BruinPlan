import React from 'react';
import { Droppable } from './Droppable.jsx'; 
import { Draggable } from './ui/Draggable.jsx'; 
import '../styles/DegreePlan.css'; 


function CourseSidebar({ categorizedClasses, electricCourseId }) {
  
  const totalCourseCount = Object.values(categorizedClasses).flat().length;

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Available Courses</h2>
        <span className="course-count">{totalCourseCount}</span>
      </div>
      
      <div className="course-categories">
        {Object.entries(categorizedClasses).map(([category, courseList]) => (
          courseList.length > 0 && (
            <div key={category} className="course-category">
              <div className="category-header">
                <h3>{category}</h3>
                <span className="category-count">{courseList.length}</span>
              </div>
              <Droppable
                id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                title=""
                items={courseList}
                electricCourseId={electricCourseId}
              >
                 {/* Render Draggable items inside the Droppable */}
                {courseList.map((item) => (
                  <Draggable 
                    key={item.id} 
                    id={item.id} 
                    item={item} 
                    showElectric={String(item.id) === electricCourseId}
                  >
                    <span className="course-code">{item.code}</span>
                    <span className="course-units">{item.units}u</span>
                  </Draggable>
                ))}
              </Droppable>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default React.memo(CourseSidebar);