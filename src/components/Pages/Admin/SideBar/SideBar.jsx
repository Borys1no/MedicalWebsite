import React from 'react';
import { useAuth } from '../../../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../Firebase/firebase';
import './SideBar.css';

const SideBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log("Sesión cerrada correctamente");
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  console.log("Usuario autenticado en SideBar:", currentUser);

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <a href="#">Agenda</a>
        <a href="#">Configuración</a>
      </div>
      <div className="perfil">
        {currentUser ? (
          <p>Bienvenido, {currentUser.email}</p>
        ) : (
          <p>Cargando información...</p>
        )}
        <button className='logout-btn' onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default SideBar;