import DotGrid from './DotGrid';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import '../styles/HomeScreen.css';

export default function HomeScreen() {
  return (
    <div className="home-page">
      {/* animated background */}
      <div className="home-bg">
        <DotGrid
          dotSize={4}
          gap={15}
          baseColor="#192225"
          activeColor="#124569"
          proximity={150}
          shockRadius={89}
          shockStrength={4}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <Header />

      <div className="home-content home-hero">
        <div className="home-bear-pill">🐻</div>

        <h1 className="home-title">Plan your UCLA Engineering journey</h1>

        <p className="home-subtitle">
          Search your engineering major to see all required classes and start shaping a
          realistic four-year plan for the Samueli School of Engineering.
        </p>

        <div className="home-search">
          <SearchBar />
        </div>

        <p className="home-helper">
          Start by typing a major like{" "}
          <span className="home-helper-highlight">Computer Science</span> or{" "}
          <span className="home-helper-highlight">Mechanical Engineering</span>.
        </p>

        <div className="home-feature-row">
          <div className="home-feature-card">
            <div className="home-feature-icon">📚</div>
            <h3 className="home-feature-title">See every requirement</h3>
            <p className="home-feature-text">
              View all required courses for your major, organized by category.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">🧩</div>
            <h3 className="home-feature-title">Drag into quarters</h3>
            <p className="home-feature-text">
              Build a quarterly layout, track units, and avoid prerequisite conflicts.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">💾</div>
            <h3 className="home-feature-title">Save multiple plans</h3>
            <p className="home-feature-text">
              Try different paths and switch between saved schedules whenever you want.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
