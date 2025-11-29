// src/components/Header.jsx
import { Link } from 'react-router-dom';
import CardNav from './CardNav';
import logo from '../assets/logo.svg';

export const Header = () => {
  const items = [
    {
      label: "Browse Majors",
      links: [
        { label: "UCLA Catalog", href: "https://catalog.registrar.ucla.edu/" },
        { label: "Bruinwalk", href: "https://bruinwalk.com/" }
      ]
    },
    {
      label: "Guidance",
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
          baseColor="rgba(255,255,255,0.08)"
          menuColor="#EAF6FF"
          buttonBgColor="#2774AE"
          buttonTextColor="#FFFFFF"
          ease="power3.out"
        />
      </div>
      <Link to="/login" style={styles.loginButton}>
        Log In
      </Link>
    </div>
  );
};

const styles = {
  wrapper: {
    width: "100%",
    position: "relative",
    zIndex: 9999,
  },

  navBar: {
    width: "100%",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)), " +
      "linear-gradient(180deg, #0a0f14 0%, #0b1520 100%)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
  },

  loginButton: {
    position: "absolute",
    top: "42.5px",
    right: "22px",
    padding: "8px 18px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2774AE 0%, #2d89cc 50%, #2774AE 100%)",
    color: "#FFFFFF",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    boxShadow: "0 8px 18px rgba(39,116,174,0.35)",
  }
};
