import { useState } from "react";

import { PlansPopUp } from "./PlansPopUp";

export function SavedPlansButton({ handleLoadScreen, getPlans }) {
    const [showPlans, setShowPlans] = useState(false)

    const handleClick = () => {
        setShowPlans(!showPlans);
    }

    return (
        <div>
            {showPlans && <PlansPopUp getPlans={getPlans} />}
            <button onClick={() => handleClick()}>Browse Saved Plans</button>
        </div>
    )
};