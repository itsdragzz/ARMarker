// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to AR Campus Flags</h1>
        <p>
          Discover and create virtual flags with messages around your campus.
          Connect with others through location-based conversations.
        </p>
        <div className="hero-buttons">
          <Link to="/ar" className="btn primary-btn">
            View Flags in AR
          </Link>
          <Link to="/create" className="btn secondary-btn">
            Create a Flag
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Discover Messages</h3>
          <p>Find virtual flags placed by others around campus using AR.</p>
        </div>
        <div className="feature-card">
          <h3>Create Flags</h3>
          <p>Leave your own messages for others to discover at specific locations.</p>
        </div>
        <div className="feature-card">
          <h3>Campus Map</h3>
          <p>View all flags on a map to see where conversations are happening.</p>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <ol>
          <li>Allow camera and location access when prompted</li>
          <li>Point your camera around to discover virtual flags</li>
          <li>Get close to a flag to read its message</li>
          <li>Create your own flags to start conversations</li>
        </ol>
      </div>
    </div>
  );
};

export default Home;