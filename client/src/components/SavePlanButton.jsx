import { useState } from 'react';

import { SavePlanPopUp } from './SavePlanPopUp';

export function SavePlanButton({ handleSavePlan }) {
    return (
        <>    
            <button >Save Plan</button>
            <SavePlanPopUp handleSavePlan={handleSavePlan}/>
        </>
    )
}