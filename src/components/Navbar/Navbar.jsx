import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <nav>
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/home">Home</Link>
          </li>
          {/* Agrega más elementos aquí si es necesario */}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
