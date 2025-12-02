// src/components/Auth.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Footer } from './Footer.jsx';
import '../styles/Auth.css';

export default function Auth() {
  const { login, signup } = useAuth();
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- DVD-style bouncing bear ---
  const arenaRef = useRef(null);
  const bearRef = useRef(null);
  const velRef = useRef({ vx: 2.2, vy: 1.8 });
  const posRef = useRef({ x: 40, y: 30 });
  const rafRef = useRef(0);

  useEffect(() => {
    const step = () => {
      const arena = arenaRef.current;
      const bear = bearRef.current;
      if (!arena || !bear) return;

      const aRect = arena.getBoundingClientRect();
      const bRect = bear.getBoundingClientRect();

      // update pos
      posRef.current.x += velRef.current.vx;
      posRef.current.y += velRef.current.vy;

      // bounce on walls
      if (posRef.current.x <= 0 || posRef.current.x + bRect.width >= aRect.width) {
        velRef.current.vx = -velRef.current.vx;
      }
      if (posRef.current.y <= 0 || posRef.current.y + bRect.height >= aRect.height) {
        velRef.current.vy = -velRef.current.vy;
      }

      // apply
      bear.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    
    if (!email || !pw) {
      setErr('Both fields are required');
      return;
    }
    
    setLoading(true);
    const result = await login(email, pw);
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
    
    if (!email || !pw) {
      setErr('Both fields are required');
      return;
    }

    // basic validation
    if (pw.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      setErr('Please enter a valid email');
      return;
    }

    setLoading(true);
    const result = await signup(email, pw);
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
    setErr(''); // Clear errors when switching modes
    setEmail('');
    setPw('');
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="bgGlow" />
      <div ref={arenaRef} className="arena" style={{ flex: 1 }}>
        <div className="card" role="region" aria-label="Authentication form">
          <h1 className="title">Login to View Saved Plans</h1>
          <form onSubmit={signUp ? onSignUpSubmit : onLoginSubmit} className="form">
            <label className="label">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@ucla.edu"
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
            {!signUp ? <p6>Don't have an account? </p6> : null}
            {!signUp ? <button type="button" className="signUpButton" onClick={() => handleChangeSignUp()}>Sign Up</button> : null}
            {signUp ? <p6>Already have an account? </p6> : null}
            {signUp ? <button type="button" className="signUpButton" onClick={() => handleChangeSignUp()}>Login</button> : null}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
