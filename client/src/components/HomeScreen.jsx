import { useState } from 'react'

// Import components
import DotGrid from './DotGrid.jsx'
import { SearchBar } from './SearchBar';
import { Header } from './Header';

export default function HomeScreen() {
    return (
        <> 
            <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
            <DotGrid 
                dotSize={4}
                gap={15}  
                baseColor="#192225" 
                activeColor="#124569"  
                proximity={150} 
                shockRadius={89}  
                shockStrength={5}  
                resistance={750}  
                returnDuration={1.5}
            />

            <Header />
            </div>
        </>
    );
}