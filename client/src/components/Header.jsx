import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CardNav from './ui/CardNav';
import logo from '../assets/logo.svg';

export const Header = () => {
  const { isAuthenticated, logout } = useAuth();
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
        <CardNav
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
      {!isAuthenticated && <Link to="/login" style={styles.loginButton}>
        Log In
      </Link>}
      {isAuthenticated && <button onClick={() => logout()} style={styles.loginButton}>Log Out</button>}
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
    top: "42.5px",
    right: "22px",
    padding: "8px 18px",
    borderRadius: "10px",
    backgroundColor: "var(--color-button-primary-bg)",
    color: "var(--color-button-primary-text)",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    boxShadow: "0 8px 18px rgba(39,116,174,0.35)",
  }
};