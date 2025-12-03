import '../styles/Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

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
