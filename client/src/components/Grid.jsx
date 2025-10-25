import React, { useState } from "react";
import {useDraggable} from '@dnd-kit/core';
import { Draggable } from "./Draggable";
import { Droppable } from "./Droppable";
import { Header } from "./Header";
import { DndContext } from "@dnd-kit/core";

// temporary classes array 
const classes = [
    "one",
    "two",
    "three"
]

export function Grid() {
    const [isDropped, setIsDropped] = useState(false);
    const draggableMarkup = (
        <Draggable>Drag me</Draggable>
    );

    return (
        <div>
            <Header />
            <DndContext onDragEnd={handleDragEnd}>
                {!isDropped ? draggableMarkup : null}
            <Droppable>
                {isDropped ? draggableMarkup : 'Drop here'}
            </Droppable>
        </DndContext>

        </div>
        
    );

    function handleDragEnd(event) {
        if (event.over && event.over.id === 'droppable') {
            setIsDropped(true);
        }
    }
}