import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import './Navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { currentUser, userLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };

  // Función para obtener la primera letra del email
  const getEmailInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : '';
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar">
      <div className="container-fluid">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <a className="nav-link active" href="/Home">INICIO</a>
          </li>
        </ul>

        <div className="text-center flex-grow-1">
          <div className="logo">
            <span>REUMA<span className="sur">SUR</span></span>
          </div>
        </div>

        <div className="d-flex align-items-center">
          {userLoggedIn ? (
            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle user-email-btn"
                type="button"
                id="userDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                title={currentUser?.email} // Tooltip con el email completo
              >
                <span className="email-initial">{getEmailInitial(currentUser?.email)}</span>
                <span className="full-email d-none">{currentUser?.email}</span>
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