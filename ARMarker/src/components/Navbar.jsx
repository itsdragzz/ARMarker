// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
        AR Campus Flags
      </Link>
    </nav>
  );
};

export default Navbar;