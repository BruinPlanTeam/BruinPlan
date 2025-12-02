import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CardNav from './ui/CardNav';
import logo from '../assets/logo.svg';
import '../styles/Header.css';

export const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="header-wrapper">
      <div className="header-nav-bar">
        <CardNav
          logo={logo}
          logoAlt="Bruin Plan"
          items={[]}
          baseColor="rgba(255,255,255,0.08)"
          menuColor="#EAF6FF"
          buttonBgColor="#2774AE"
          buttonTextColor="#FFFFFF"
          ease="power3.out"
        />
      </div>
      {!isAuthenticated && <Link to="/login" className="header-login-button">
        Log In
      </Link>}
      {isAuthenticated && <button onClick={() => logout()} className="header-login-button">Log Out</button>}
    </div>
  );
};
