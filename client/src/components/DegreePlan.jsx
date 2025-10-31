import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

import { Draggable } from './Draggable';
import { Droppable } from './Droppable';

import { Header } from './Header';
import { Grid } from './Grid';

export default function DegreePlan() {
  const containers = ['Fall', 'Winter', 'Spring', 'Summer'];
  const classes = ['Math', 'CS', 'Physics', 'Philosophy'];

  // reduce the classes array into one object of the form {Class: value, ...}
  const [parentState, setParentState] = useState(
    classes.reduce((acc, id) => {
      acc[id] = "home"; 
      return acc;
    }, {})
  );

  // function to pass the map function
  function createDraggable(id) {
    return (
      <Draggable key={id} id={id}>
        {id}
      </Draggable>
    );
  }

  // filter classes into classes just in containerId, then map them to Draggable Objects
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
    // syntactic sugar for const val = event.val
    const { active, over } = event;
    const newParent = over ? over.id : null;

    console.log("active: ", active, "over: ", over)
    
    if (parentState[active.id] === newParent) {
      return;
    }

    setParentState((prev) => ({
      ...prev,
      [active.id]: newParent,
    }));
  }
}
