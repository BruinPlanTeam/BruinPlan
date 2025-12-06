import { useState } from 'react'

// import components
import DotGrid from '../components/ui/DotGrid.jsx'
import { SearchBar } from '../components/SearchBar.jsx';
import { Header } from '../components/Header.jsx';
import { Footer } from '../components/Footer.jsx';
import { SessionExpiredPopup } from '../components/SessionExpiredPopup.jsx';
import { useAuth } from '../contexts/AuthContext';
import '../styles/HomeScreen.css';

export default function HomeScreen() {
    const { showSessionExpiredPopup, setShowSessionExpiredPopup } = useAuth();

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
                <SearchBar />
            </div>
            <Footer />

            {showSessionExpiredPopup && (
                <SessionExpiredPopup onClose={() => setShowSessionExpiredPopup(false)} />
            )}
        </div>
    );
}