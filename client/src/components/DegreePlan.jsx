import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';

import { Header } from './Header';
import { ClassesList } from './ClassesList';
import { Grid } from './Grid';

export default function DegreePlan() {
  const containers = ['Fall', 'Winter', 'Spring', 'Summer'];
  const classes = ['Math 101', 'Physics 210', 'CS 101', 'History 110'];

  const [parentState, setParentState] = useState(
    classes.reduce((acc, id) => {
      acc[id] = null; 
      return acc;
    }, {})
  );

  function createDraggable(id) {
    return (
      <Draggable key={id} id={id}>
        {id}
      </Draggable>
    );
  }

  function getClassesForContainer(containerId) {
    return classes
      .filter((id) => parentState[id] === containerId)
      .map(createDraggable);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
    <Header />
      <div className="w-full max-w-4xl mx-auto p-4 font-sans flex flex-col md:flex-row gap-4">
        
        <ClassesList getClassesForContainer={getClassesForContainer} />
        <Grid containers={containers} getClassesForContainer={getClassesForContainer} />

      </div>
    </DndContext>
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    const newParent = over ? over.id : null;
    
    if (parentState[active.id] === newParent) {
      return;
    }

    setParentState((prev) => ({
      ...prev,
      [active.id]: newParent,
    }));
  }
}
