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
          <p>Find virtual flags placed by others around campus using AR. Flags are only visible when you're within 10 meters and looking in the right direction!</p>
        </div>
        <div className="feature-card">
          <h3>Create Flags</h3>
          <p>Leave your own messages for others to discover at specific locations. The flag appears in the direction you're facing when you create it.</p>
        </div>
        <div className="feature-card">
          <h3>Campus Map</h3>
          <p>View all flags on a map to see where conversations are happening, even if they're not in your immediate view.</p>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <ol>
          <li>Allow camera, location, and motion access when prompted</li>
          <li>Point your camera around to discover virtual flags - they appear at the angle they were created</li>
          <li>Flags are only visible when you're within 10 meters and looking in the right direction</li>
          <li>Tap on a flag to read its message and see who created it</li>
          <li>Create your own flags to start conversations</li>
        </ol>
      </div>
      
      <div className="ar-tips">
        <h2>AR Tips</h2>
        <ul>
          <li><strong>Compass:</strong> The compass indicator shows which direction you're facing</li>
          <li><strong>Field of View:</strong> You can only see flags within your field of view (~60°)</li>
          <li><strong>Flag Count:</strong> The counter shows how many flags are visible out of the total nearby</li>
          <li><strong>Creating Flags:</strong> When creating a flag, point your camera in the direction you want the flag to appear</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;