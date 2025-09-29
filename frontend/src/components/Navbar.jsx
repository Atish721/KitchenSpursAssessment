import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Restaurant Analytics
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Restaurants</Link>
          <Link to="/top-restaurants" className="nav-link">Top Restaurants</Link>
          <Link to="/filtered-analytics" className="nav-link">Filter Analytics</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;