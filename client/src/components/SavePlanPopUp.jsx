import { useState } from 'react';

export function SavePlanPopUp({ handleSavePlan }) {
    const [planName, setPlanName] = useState('');

    return (
        <div>
            <h1>Save Plan</h1>
            <input type="text" placeholder="Plan Name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
            <button onClick={() => handleSavePlan(planName)}>Save</button>
        </div>
    )
}