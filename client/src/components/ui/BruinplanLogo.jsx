import React from 'react';
import logoSrc from '../assets/bruinplanlogoitalicizedcropped.png';
import { useNavigate } from 'react-router-dom';

function BruinplanLogo() {
  const navigate = useNavigate();
  return (
    <img src={logoSrc} alt="Bruin Plan" onClick={() => navigate('/')} style={{ height: '100%' }} />
  );
}

export default BruinplanLogo; 