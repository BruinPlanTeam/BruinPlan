import { useState, useEffect } from 'react';
import '../styles/Footer.css';

export const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      //show footer when user has scrolled down at least 50px OR user is near the bottom of the page (within 200px)
      const isNearBottom = scrollY + windowHeight >= documentHeight - 200;
      setIsVisible(scrollY > 50 || isNearBottom);
    };

    //check on mount in case page is already scrolled
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
            {currentYear} CourseCompiler Team | Built for CS35L at UCLA
        </p>
        <div className="footer-links">
          <a 
            href="https://catalog.registrar.ucla.edu/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            UCLA Catalog
          </a>
          <span className="footer-separator">•</span>
          <a 
            href="https://bruinwalk.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            Bruinwalk
          </a>
        </div>
      </div>
    </footer>
  );
};