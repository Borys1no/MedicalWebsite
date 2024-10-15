import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">Dr. Emilio Aroca Briones</div>
        <ul className="navbar-menu">
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Servicios</a></li>
          <li><a href="#">Especialidades</a></li>
          <li><a href="#">Nosotros</a></li>
          <li><a href="#">Facturación</a></li>
          <li><button className="login-button">Iniciar sesión</button></li>
        </ul>
      </nav>

      {/* Banner Principal */}
      <header className="banner">
        <div className="banner-content">
          <h1>Cuida tu salud a cualquier hora</h1>
          <p>Consulta a tu médico de manera virtual con facilidad.</p>
          <button className="primary-button">Agenda tu Cita Médica</button>
        </div>
      </header>

      {/* Buscador de Especialidad */}
      <section className="specialty-search">
        <input type="text" placeholder="Buscar especialidad" className="search-input" />
        <button className="search-button">Buscar</button>
      </section>

      {/* Sección de Servicios */}
      <section className="services">
        <h2>Servicios Destacados</h2>
        <div className="services-cards">
          <div className="service-card">
            <div className="service-icon">[Icono]</div>
            <h3>Cardiología</h3>
            <p>Especialistas en el cuidado del corazón.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">[Icono]</div>
            <h3>Nutrición</h3>
            <p>Asesoría para una alimentación saludable.</p>
          </div>
          <div className="service-card">
            <div className="service-icon">[Icono]</div>
            <h3>Pediatría</h3>
            <p>Cuidados especializados para los más pequeños.</p>
          </div>
        </div>
      </section>

      {/* Testimonios de Pacientes */}
      <section className="testimonials">
        <h2>Testimonios de Pacientes</h2>
        <div className="testimonial">
          <p>"El servicio fue excelente, pude consultar a mi médico desde la comodidad de mi hogar."</p>
          <span>- Paciente Satisfecho</span>
        </div>
        <div className="testimonial">
          <p>"Gracias a esta plataforma, agendar mi cita fue rápido y fácil."</p>
          <span>- María López</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Doctor Web. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;
