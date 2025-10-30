import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';

import { Header } from './Header';
import { Grid } from './Grid';

export default function DegreePlan() {
  const containers = ['Fall', 'Winter', 'Spring', 'Summer'];
  const classes = ['Math', 'CS', 'Physics', 'Philosophy'];

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
      <div> 
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
