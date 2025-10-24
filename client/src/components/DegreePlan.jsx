import React, { useState } from "react";
import { useMajor } from "../Major";

export default function DegreePlan() {
    const { major, handleMajorSelect } = useMajor();

    return (
        <h1>{major}</h1>
    )

}