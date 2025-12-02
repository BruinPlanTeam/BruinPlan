import React from 'react';
import logoSrc from '../assets/bruinplanlogoitalicizedcropped.png';
import { useNavigate } from 'react-router-dom';
import '../../styles/BruinplanLogo.css';

function BruinplanLogo() {
  const navigate = useNavigate();
  return (
    <img src={logoSrc} alt="Bruin Plan" onClick={() => navigate('/')} className="bruinplan-logo" />
  );
}

export default BruinplanLogo; 