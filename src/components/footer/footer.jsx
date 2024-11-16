import React from 'react';
import './footer.css';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Columna Información */}
        <div className="footer-company">
          <span>REUMA<span className="sur">SUR</span></span>
          <p className="footer-tagline">Cuida tu salud a cualquier hora</p>
        </div>
        {/* Columna Contacto */}
        <div className="footer-contact">
          <p>Dir: Bocayá el Colón y Tarqui (Centro de Diagnóstico CEDIAG)</p>
          <p>Machala - El Oro, Ecuador</p>
          <p>Teléfono: 0980304357</p>
          <p>Email: <a href="mailto:emilio_aroca@yahoo.com">emilio_aroca@yahoo.com</a></p>
        </div>
        {/* Columna Redes Sociales */}
        <div className="footer-social">
          <p className="footer-social-title">
            Nuestras redes sociales
          </p>
          <a href="https://www.facebook.com/emilioarocab/?locale=es_LA" target="_blank" rel="noopener noreferrer">
            <img src={assets.FacebookIcon2} alt="Facebook" className="social-icon" /> Facebook
          </a>
          <a href="https://www.instagram.com/dremilioarocabriones/" target="_blank" rel="noopener noreferrer">
            <img src={assets.InstagramIcon2} alt="Instagram" className="social-icon" /> Instagram
          </a>
          <a href="https://x.com/EmilioArocaB" target="_blank" rel="noopener noreferrer">
            <img src={assets.X} alt="Profile" className="social-icon" />
             Perfil de X

          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Centro de Diagnóstico CEDIAG. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
