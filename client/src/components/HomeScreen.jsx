import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { Header } from './Header';
import './HomeScreen.css';

export default function HomeScreen() {
  const [quote, setQuote] = useState("Plan smarter. Graduate.");

  return (
    <> 
      <Header />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '80px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#2774AE' }}>
          BruinPlan <span className="bouncing-bear">🐻</span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#444', marginBottom: '1rem' }}>
          {quote}
        </p>

        <SearchBar />

        <div style={{ marginTop: '2rem' }}>
          <Link to="/planner">
            <button style={{
              padding: '0.8rem 1.6rem',
              backgroundColor: '#2774AE',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              Start Planning
            </button>
          </Link>
        </div>

        <div style={{ marginTop: '3rem', color: '#666', fontSize: '0.9rem' }}>
          <p>Built by UCLA students, for UCLA students.</p>
        </div>
      </div>
    </>
  );
}
