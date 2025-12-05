import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import NavBar from './ui/NavBar';
import logo from '../assets/logo2.png';

export const Header = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isDegreePlanPage = location.pathname === '/degreeplan';
  
  // intercept navigation from degree plan page
  const handleNavigation = (e, targetPath) => {
    if (isDegreePlanPage) {
      const confirmed = window.confirm('You may lose unsaved progress. Are you sure you want to leave?');
      if (!confirmed) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    return true;
  };
  
  const items = [
    {
      label: "Browse Majors",
      bgColor: "rgba(10, 18, 28, 0.92)", 
      textColor: "#EAF6FF",
      links: [
        { label: "UCLA Catalog", href: "https://catalog.registrar.ucla.edu/" },
        { label: "Bruinwalk", href: "https://bruinwalk.com/" }
      ]
    },
    {
      label: "Guidance",
      bgColor: "rgba(8, 15, 22, 0.95)",
      textColor: "#EAF6FF",
      links: [
        { label: "Sample 4-Year Schedules", href: "https://www.ugeducation.ucla.edu/degreepath/majors/" },
        { label: "Degree Planning Tips", href: "https://newstudents.ucla.edu/wp-content/uploads/2017/10/Degree-Planner.pdf" },
      ]
    }
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.navBar}>
        <NavBar
          logo={logo}
          logoAlt="Bruin Plan"
          items={items}
          baseColor="rgba(0,0,0,0.3)"
          menuColor="#EAF6FF"
          buttonBgColor="var(--color-button-primary-bg)"
          buttonTextColor="var(--color-button-primary-text)"
          ease="power3.out"
        />
      </div>
      {!isAuthenticated && !isLoginPage && (
        <Link 
          to="/login" 
          style={styles.loginButton}
          onClick={(e) => !handleNavigation(e, '/login') && e.preventDefault()}
        >
          Log In
        </Link>
      )}
      {isAuthenticated && (
        <Link 
          to="/profile" 
          style={styles.profileButton}
          onClick={(e) => !handleNavigation(e, '/profile') && e.preventDefault()}
        >
          <FaUserCircle size={20} />
        </Link>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },

  navBar: {
    width: "100%",
    backgroundColor: "var(--color-bg-surface)",
    borderBottom: "1px solid rgba(201,207,212,0.25)",
    backdropFilter: "blur(10px)",
  },

  loginButton: {
    position: "absolute",
    top: "50%",
    right: "22px",
    transform: "translateY(-50%)",
    padding: "8px 18px",
    borderRadius: "10px",
    backgroundColor: "var(--color-button-primary-bg)",
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    boxShadow: "0 8px 18px rgba(39,116,174,0.35)",
  },
  profileButton: {
    position: "absolute",
    top: "50%",
    right: "22px",
    transform: "translateY(-50%)",
    padding: "8px",
    borderRadius: "10px",
    backgroundColor: "var(--color-button-primary-bg)",
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 18px rgba(39,116,174,0.35)",
    transition: "opacity 0.2s ease",
  }
};