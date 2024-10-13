import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="banner">
          <div className="banner-content">
            <h1 className="banner-title">Cuida tu salud a cualquier hora</h1>
            <p className="banner-subtitle">Monitoreo de hipertensión, niveles de glucosa, y más</p>
            <button className="btn-primary">Agenda tu Cita Médica</button>
          </div>
        </div>
      </header>
      <section className="specialties-section">
        <h2 className="section-title">Nuestras Especialidades</h2>
        <div className="specialties-grid">
          <div className="specialty-card">
            <div className="icon-placeholder">[Icono]</div>
            <h3>Cardiología</h3>
            <p>Cuida tu corazón con nuestros expertos en cardiología.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">[Icono]</div>
            <h3>Nutrición</h3>
            <p>Mejora tu salud alimenticia con nuestros especialistas en nutrición.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">[Icono]</div>
            <h3>Pediatría</h3>
            <p>El mejor cuidado para la salud de los más pequeños.</p>
          </div>
        </div>
      </section>
      <section className="testimonial-section">
        <h2 className="section-title">Testimonios de Pacientes</h2>
        <div className="testimonial">
          <p>"Gracias a la atención online he podido continuar mis consultas sin importar la distancia."</p>
          <span>- María Pérez</span>
        </div>
      </section>
    </div>
  );
};

export default Home;