import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlanManager } from '../hooks/planManager';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import '../styles/Profile.css';

export default function Profile() {
  const { user, logout, updateUsername } = useAuth();
  const navigate = useNavigate();
  const { getPlans, loadPlan } = usePlanManager();
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getPlans();
        setSavedPlans(plans);
      } catch (error) {
        console.error('Failed to load plans:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPlans();
    }
  }, [user, getPlans]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePlanClick = (plan) => {
    // store plan in localstorage so degreeplan can load it
    localStorage.setItem('pendingPlanToLoad', JSON.stringify(plan));
    navigate('/degreeplan');
  };

  const handleEditUsername = () => {
    if (user?.username) {
      setUsernameValue(user.username);
      setIsEditingUsername(true);
    }
  };

  const handleSaveUsername = async () => {
    if (!usernameValue.trim()) return;
    try {
      const result = await updateUsername(usernameValue.trim());
      if (result.success) {
        setIsEditingUsername(false);
      } else {
        alert(result.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Failed to update username:', error);
      alert('Failed to update username');
    }
  };

  const handleCancelEditUsername = () => {
    setIsEditingUsername(false);
    setUsernameValue('');
  };

  return (
    <div className="profile-page-container">
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <h1 className="profile-title">Profile</h1>
          <div className="profile-content">
            {user?.username && (
              <div className="profile-field">
                <span className="profile-label">Username:</span>
                {isEditingUsername ? (
                  <div className="profile-username-edit">
                    <input
                      type="text"
                      value={usernameValue}
                      onChange={(e) => setUsernameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveUsername();
                        if (e.key === 'Escape') handleCancelEditUsername();
                      }}
                      className="profile-username-input"
                      autoFocus
                    />
                    <button onClick={handleSaveUsername} className="profile-username-save-btn">✓</button>
                    <button onClick={handleCancelEditUsername} className="profile-username-cancel-btn">✕</button>
                  </div>
                ) : (
                  <div className="profile-username-box">
                    <span className="profile-value">{user.username}</span>
                    <button onClick={handleEditUsername} className="profile-username-edit-btn" aria-label="Edit username">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="profile-plans-section">
              <h2 className="profile-plans-title">Saved Plans</h2>
              {loading ? (
                <div className="profile-plans-loading">Loading plans...</div>
              ) : savedPlans.length === 0 ? (
                <div className="profile-plans-empty">
                  <p>No saved plans yet</p>
                  <p className="profile-plans-empty-subtext">Create a degree plan and save it to see it here</p>
                </div>
              ) : (
                <div className="profile-plans-list">
                  {savedPlans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="profile-plan-card"
                      onClick={() => handlePlanClick(plan)}
                    >
                      <div className="profile-plan-card-header">
                        <h3 className="profile-plan-card-name">{plan.name}</h3>
                        <svg 
                          className="profile-plan-card-arrow" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none"
                        >
                          <path 
                            d="M9 18L15 12L9 6" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="profile-plan-card-details">
                        <span className="profile-plan-card-major">{plan.major?.name || 'Unknown Major'}</span>
                        <span className="profile-plan-card-dot">•</span>
                        <span className="profile-plan-card-date">
                          {plan.quarters?.length || 0} quarters
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="profile-logout-button">
              Log Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

