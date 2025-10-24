import React from 'react'
import BruinplanLogo from './BruinplanLogo';
import { MajorCatalog } from './MajorCatalog';
import '../App.css' 

export function Header() {
    function refreshPage() {
        console.log("refreshed!")

        // I think there is a better way to do this, this will wipe the state
        window.location.reload();
    }

    return (
        <div className='header-container'>
            <BruinplanLogo onRefresh={refreshPage} className='header-logo'/>
            <div className='right-header-container'>
                <MajorCatalog />
            </div>   
        </div>
    );
}