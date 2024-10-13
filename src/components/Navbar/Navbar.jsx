import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">DoctorWeb</div>
        <ul className="nav-links">
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Servicios</a></li>
          <li><a href="#">Especialidades</a></li>
          <li><a href="#">Nosotros</a></li>
          <li><a href="#">Facturación</a></li>
          <li><button className="btn-login">Iniciar sesión</button></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;