import { useState } from 'react'

// import components
import DotGrid from '../components/ui/DotGrid.jsx'
import { SearchBar } from '../components/SearchBar.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import SearchBarTitle from '../components/ui/SearchBarTitle.jsx'
import '../styles/HomeScreen.css';

const handleAnimationComplete = () => {
    console.log('Animation completed!');
};

export default function HomeScreen() {
    return (
        <div className="home-screen-container">
            <DotGrid 
                dotSize={4}
                gap={15}  
                baseColor="#2774AE" 
                activeColor="#FAEDBD"  
                proximity={150} 
                shockRadius={89}  
                shockStrength={4}  
                resistance={750}  
                returnDuration={1.5}
            />

            <Header />
            <div className="search-wrapper">
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
            <Footer />
        </div>
    );
}