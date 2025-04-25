// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src="/assets/flag-icon.svg" alt="AR Campus Flags" />
          <span>AR Campus Flags</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">View Flags</Link>
        </li>
        <li>
          <Link to="/create">Create Flag</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;