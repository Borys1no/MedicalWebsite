import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext'; // Importar el contexto de autenticación
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
    <nav className="navbar navbar-expand-lg custom-navbar"> {/* Agregar clase personalizada */}
      <div className="container-fluid">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <a className="nav-link active" href="/Home">INICIO</a>
          </li>
        </ul>

        <div className="text-center flex-grow-1"> {/* Ajuste de centrado total */}
        <div className="logo">
            <span>REUMA<span className="sur">SUR</span></span>
          </div>
        </div>

        <div className="d-flex align-items-center">
          {userLoggedIn ? (  // Verificar si el usuario está logueado
            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {currentUser?.email}
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a className="dropdown-item" href="/ProfileC">Perfil</a></li>
                <li><a className="dropdown-item" href="/settings">Configurar</a></li>
                <li><button onClick={handleLogout} className="dropdown-item">Cerrar sesión</button></li>
              </ul>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-outline-primary">
              INICIAR SESIÓN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
