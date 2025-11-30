// src/components/Auth.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { login, signup } = useAuth();
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
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
    
    try {
      await login(email, pw);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setErr('Network error. Please try again.');
    }
  };

  const onSignUpSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !pw) {
      setErr('Both fields are required');
      return;
    }

    try {
      await signup(email, pw);
      navigate('/');

      setSignUp(false);
      setErr('Account created! Please log in.');
    } catch (error) {
      setErr(error.message || 'Network error. Please try again.');
    }
  };

  const handleChangeSignUp = () => {
    setSignUp(!signUp);
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow} />
      <div ref={arenaRef} style={styles.arena}>
        <div ref={bearRef} style={styles.bear} aria-hidden>🐻</div>
        <div style={styles.card} role="region" aria-label="Authentication form">
          <h1 style={styles.title}>Login to View Saved Plans</h1>
          <form onSubmit={signUp ? onSignUpSubmit : onLoginSubmit} style={styles.form}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@ucla.edu"
                style={styles.input}
                required
              />
            </label>
            <label style={styles.label}>
              Password
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </label>
            {err ? <p style={styles.error}>{err}</p> : null}
            {!signUp ? <button type="submit" style={styles.button}>Log In</button> : null}
            {signUp ? <button type="submit" style={styles.button}>Sign Up</button> : null}
            {!signUp ? <p6>Don't have an account? </p6> : null}
            {!signUp ? <button type="button" style={styles.signUpButton} onClick={() => handleChangeSignUp()}>Sign Up</button> : null}
            {signUp ? <p6>Already have an account? </p6> : null}
            {signUp ? <button type="button" style={styles.signUpButton} onClick={() => handleChangeSignUp()}>Login</button> : null}
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'grid',
    placeItems: 'center',
    background:
      'radial-gradient(1000px 600px at 20% 10%, rgba(39,116,174,0.20), transparent), ' +
      'radial-gradient(900px 500px at 80% 90%, rgba(255,209,0,0.18), transparent), ' +
      'linear-gradient(180deg, #0a0f14 0%, #0b1520 100%)',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    filter: 'blur(40px)',
  },
  arena: {
    position: 'relative',
    width: 'min(92vw, 920px)',
    height: 'min(78vh, 620px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  bear: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: '40px',
    lineHeight: 1,
    filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
    userSelect: 'none',
    willChange: 'transform',
    transition: 'filter 120ms ease',
  },
  card: {
    position: 'absolute',
    inset: '50% auto auto 50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(92%, 420px)',
    padding: '28px',
    borderRadius: '16px',
    background: 'rgba(13, 23, 33, 0.75)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.35)',
    color: '#e9f0f5',
  },
  title: {
    margin: '0 0 14px',
    fontSize: '1.35rem',
    fontWeight: 700,
    letterSpacing: '0.2px',
    color: '#EAF6FF',
    textAlign: 'center',
  },
  form: {
    display: 'grid',
    gap: '12px',
  },
  label: {
    display: 'grid',
    gap: '6px',
    fontSize: '0.9rem',
    color: '#CFE7FF',
  },
  input: {
    height: '44px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(8,15,22,0.65)',
    color: '#EAF6FF',
    padding: '0 12px',
    outline: 'none',
    fontSize: '0.95rem',
  },
  button: {
    marginTop: '6px',
    height: '44px',
    borderRadius: '10px',
    border: 'none',
    background:
      'linear-gradient(135deg, #2774AE 0%, #2d89cc 50%, #2774AE 100%)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(39,116,174,0.35)',
    transition: 'transform 0.08s ease',
  },
  signUpButton: {
    marginTop: '6px',
    height: '44px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#EAF6FF',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '0.9rem',
    margin: '4px 0 0',
    textAlign: 'center',
  },
};
