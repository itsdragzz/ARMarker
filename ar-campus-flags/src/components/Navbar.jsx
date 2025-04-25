// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src="/assets/flag-icon.svg" alt="Flag" className="nav-icon" />
        <h1>AR Campus Flags</h1>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/ar" className={location.pathname === '/ar' ? 'active' : ''}>
          AR View
        </Link>
        <Link to="/map" className={location.pathname === '/map' ? 'active' : ''}>
          Map
        </Link>
        <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>
          Create Flag
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;