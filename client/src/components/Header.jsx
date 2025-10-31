import React from 'react'
import BruinplanLogo from './BruinplanLogo';
import { MajorCatalog } from './MajorCatalog';
import '../App.css' 

export function Header() {
    return (
        <div className='header-container'>
            <BruinplanLogo className='header-logo'/>
            <div className='right-header-container'>
                <MajorCatalog />
            </div>   
        </div>
    );
}