import React from 'react';
import logoSrc from '../assets/bruinplanlogoitalicizedcropped.png';

function BruinplanLogo({ onRefresh }) {
  return (
    <img src={logoSrc} alt="Bruin Plan" onClick={onRefresh} style={{ height: '100%' }} />
  );
}

export default BruinplanLogo;