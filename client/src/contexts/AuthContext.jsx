import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { getJWTExpiration } from '../utils/jwt';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpiredPopup, setShowSessionExpiredPopup] = useState(false);
  const expirationTimerRef = useRef(null);
  const onSessionExpiringCallbackRef = useRef(null);

  // load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    // Check if we should show session expired popup
    const shouldShowPopup = localStorage.getItem('showSessionExpiredPopup') === 'true';
    if (shouldShowPopup) {
      setShowSessionExpiredPopup(true);
      localStorage.removeItem('showSessionExpiredPopup');
    }
    
    setLoading(false);
  }, []);

  // Monitor JWT expiration and set up timer
  useEffect(() => {
    // Clear any existing timer
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }

    if (!token) {
      return;
    }

    const expirationTime = getJWTExpiration(token);
    if (!expirationTime) {
      return;
    }

    const now = Date.now();
    // Calculate time until 10 seconds before expiration
    const timeUntilAutoSave = expirationTime - now - 10000; // 10 seconds before expiration

    if (timeUntilAutoSave > 0) {
      expirationTimerRef.current = setTimeout(async () => {
        // 10 seconds before expiration - trigger autosave and logout
        try {
          // Call the autosave callback if it exists
          if (onSessionExpiringCallbackRef.current) {
            await onSessionExpiringCallbackRef.current();
          }
        } catch (error) {
          console.error('Error during autosave before session expiration:', error);
        }

        // Logout and navigate to homepage
        logout();
        
        // Set flag in localStorage to show popup after navigation
        localStorage.setItem('showSessionExpiredPopup', 'true');
        
        // Navigate to homepage
        window.location.href = '/';
      }, timeUntilAutoSave);
    } else {
      // Token is already expired or will expire in less than 10 seconds
      // Try autosave first, then logout immediately
      (async () => {
        try {
          if (onSessionExpiringCallbackRef.current) {
            await onSessionExpiringCallbackRef.current();
          }
        } catch (error) {
          console.error('Error during autosave before session expiration:', error);
        }
        
        // Logout and navigate to homepage
        logout();
        
        // Set flag in localStorage to show popup after navigation
        localStorage.setItem('showSessionExpiredPopup', 'true');
        
        // Navigate to homepage
        window.location.href = '/';
      })();
    }

    // Cleanup on unmount or token change
    return () => {
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
    };
  }, [token]);

  // Function to register autosave callback
  const setOnSessionExpiring = (callback) => {
    onSessionExpiringCallbackRef.current = callback;
  };

  // Function to clear autosave callback
  const clearOnSessionExpiring = () => {
    onSessionExpiringCallbackRef.current = null;
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      // check if response is ok before trying to parse json
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore json parse errors
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // update state
      setUser(data.user);
      setToken(data.token);
      
      // save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      // provide more helpful error messages
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        return { 
          success: false, 
          error: `Cannot connect to server. Make sure the backend is running on ${API_BASE_URL}` 
        };
      }
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const signup = async (username, password) => {
    try {
      const response = await fetch(API_ENDPOINTS.signup, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      // check if response is ok before trying to parse json
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore json parse errors
        }
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // signup successful - now auto-login
      return await login(username, password);
    } catch (error) {
      console.error('Signup error:', error);
      // provide more helpful error messages
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        return { 
          success: false, 
          error: `Cannot connect to server. Make sure the backend is running on ${API_BASE_URL}` 
        };
      }
      return { success: false, error: error.message || 'Signup failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear expiration timer
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
    // Clear autosave callback
    clearOnSessionExpiring();
  };

  const updateUsername = async (newUsername) => {
    try {
      const response = await fetch(API_ENDPOINTS.updateUsername, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername })
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          // ignore json parse errors
        }
        throw new Error(errorData.error || 'Failed to update username');
      }

      const data = await response.json();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Update username error:', error);
      return { success: false, error: error.message || 'Failed to update username' };
    }
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    updateUsername,
    isAuthenticated,
    loading,
    showSessionExpiredPopup,
    setShowSessionExpiredPopup,
    setOnSessionExpiring,
    clearOnSessionExpiring
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}