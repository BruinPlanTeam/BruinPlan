import { useState } from 'react'

// import components
import DotGrid from '../components/ui/DotGrid.jsx'
import { SearchBar } from '../components/SearchBar.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import SearchBarTitle from '../components/ui/SearchBarTitle.jsx'

const handleAnimationComplete = () => {
    console.log('Animation completed!');
};

export default function HomeScreen() {
    return (
        <> 
            <div style={{ width: '100%', minHeight: 'calc(100vh + 1px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <DotGrid 
                dotSize={4}
                gap={15}  
                baseColor="#192225" 
                activeColor="#124569"  
                proximity={150} 
                shockRadius={89}  
                shockStrength={4}  
                resistance={750}  
                returnDuration={1.5}
            />

            <Header />
            <div className="search-wrapper" style={{ flex: 1, paddingBottom: '60px' }}>
                {/* <SearchBarTitle 
                    text="Bruin Plan"
                    delay={150}
                    animateBy="words"   
                    direction="top"   
                    onAnimationComplete={handleAnimationComplete}
                    className="search-bar-title"
                /> */}
                <SearchBar />
            </div>
            </div>
            <Footer />
        </>
    );
}