import React from 'react';
import logoSrc from '../assets/coursecompilerlogoitalicizedcropped.png';
import { useNavigate } from 'react-router-dom';
import '../../styles/CourseCompilerLogo.css';

function CourseCompilerLogo() {
  const navigate = useNavigate();
  return (
    <img src={logoSrc} alt="CourseCompiler" onClick={() => navigate('/')} className="coursecompiler-logo" />
  );
}

export default CourseCompilerLogo; 