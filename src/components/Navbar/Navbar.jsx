import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; // Importar el contexto de autenticación
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { currentUser, userLoggedIn, logout } = useAuth(); // Obtener el usuario autenticado y la función de logout
  const navigate = useNavigate();

  // Manejar el redimensionamiento de la pantalla
  const handleResize = () => {
    window.innerWidth > 768 ? setIsMobile(false) && setIsNavOpen(false) : setIsMobile(true);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Función para manejar el logout
  const handleLogout = async () => {
    try {
      await logout(); // Llamamos a la función para cerrar sesión
      navigate('/login'); // Redirigir al login después del logout
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary ">
      <div className="container-fluid">
        <p className="navbar-brand">Dr. Emilio Aroca Briones</p>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo02" aria-controls="navbarTogglerDemo02" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" href="#">Inicio</a>
            </li>
            <li className="nav-item">
              <a className="nav-link active" href="#">Nosotros</a>
            </li>
          </ul>

          <div className="d-flex" role="search">
            {userLoggedIn ? (  // Verificar si el usuario está logueado
              <div className="user-logged-in">
                <span>{currentUser?.email}</span> {/* Muestra el email del usuario autenticado */}
                <button onClick={handleLogout} className="btn btn-outline-danger">Cerrar sesión</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="btn btn-outline-primary">
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
