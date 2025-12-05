// src/components/Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import '../styles/Auth.css';

export default function Auth() {
  const { login, signup } = useAuth();
  const [signUp, setSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    
    if (!username || !pw) {
      setErr('Both fields are required');
      return;
    }
    
    setLoading(true);
    const result = await login(username, pw);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setErr(result.error || 'Login failed. Please try again.');
    }
  };

  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    
    if (!username || !pw || !confirmPw) {
      setErr('All fields are required');
      return;
    }

    // basic validation
    if (pw.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }

    if (pw !== confirmPw) {
      setErr('Passwords do not match');
      return;
    }

    if (username.length < 3) {
      setErr('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    const result = await signup(username, pw);
    setLoading(false);
    
    if (result.success) {
      // signup auto-logs in, so navigate to home
      navigate('/');
    } else {
      setErr(result.error || 'Signup failed. Please try again.');
    }
  };

  const handleChangeSignUp = () => {
    setSignUp(!signUp);
    setErr(''); // clear errors when switching modes
    setUsername('');
    setPw('');
    setConfirmPw('');
  };

  return (
    <div className="auth-page-container">
      <Header />
      <div className="page">
        <div className="arena">
          <div className="card" role="region" aria-label="Authentication form">
            <h1 className="title">{signUp ? 'Sign Up' : 'Log In'}</h1>
            <form onSubmit={signUp ? onSignUpSubmit : onLoginSubmit} className="form">
              <label className="label">
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="eg: owen123"
                  className="input"
                  required
                />
              </label>
              <label className="label">
                Password
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  required
                />
              </label>
              {signUp && (
                <label className="label">
                  Confirm Password
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    className="input"
                    required
                  />
                </label>
              )}
              {err ? <p className="error">{err}</p> : null}
              {!signUp ? (
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              ) : (
                <button type="submit" className="button" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              )}
              <div className="auth-toggle">
                {!signUp ? (
                  <>
                    <span className="auth-toggle-text">Don&apos;t have an account?</span>
                    <button
                      type="button"
                      className="signUpButton"
                      onClick={handleChangeSignUp}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <span className="auth-toggle-text">Already have an account?</span>
                    <button
                      type="button"
                      className="signUpButton"
                      onClick={handleChangeSignUp}
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
