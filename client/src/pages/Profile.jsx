import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../styles/Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">Profile</h1>
          <div className="profile-content">
            {user?.email && (
              <div className="profile-field">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{user.email}</span>
              </div>
            )}
            <button onClick={logout} className="profile-logout-button">
              Log Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

