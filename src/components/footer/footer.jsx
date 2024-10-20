import React from 'react';
import './Footer.css';
import { assets } from '../../../assets/assets';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-contact">
          <p>Dir: Bocay&aacute; el Col&oacute;n y Tarqui (Centro de Diagn&oacute;stico CEDIAG)</p>
          <p>Machala - El Oro, Ecuador</p>
          <p>Tel&eacute;fono: 0980304357</p>
          <p>Email: emilio_aroca@yahoo.com</p>
        </div>
        <div className="footer-social">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <img src={assets.instagramIcon} alt="Instagram" className="social-icon" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Centro de Diagn&oacute;stico CEDIAG. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
