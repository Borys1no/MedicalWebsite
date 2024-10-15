import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary ">
      <div className="container-fluid ">
        <p className="navbar-brand ">Dr. Emilio Aroca Briones</p>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon "></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active  "  href="#">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active " href="#">Especialidades</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active " href="#">Nosotros</a>
            </li>

          </ul>
          <form className="d-flex" role="search">
            <button className="btn  " type="submit">Iniciar sesion</button>
          </form>
        </div>
      </div>
    </nav>

  );
};

export default Navbar;