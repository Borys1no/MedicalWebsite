import React from 'react';
import './Home.css';
import { assets } from '../../../assets/assets';


const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <div className="banner">
          <img src={assets.Banner} alt="Banner" />
          <div className="banner-content">
            <h1 className="banner-title">Cuida tu salud a cualquier hora</h1>
            <p className="banner-subtitle">Monitoreo de hipertensión, niveles de glucosa, y más</p>
            <a href="#" className="btn-primary">Agenda tu Cita Médica</a>
          </div>
        </div>
      </header>
      <section className="specialties-section">
        <h2 className="section-title">Nuestras Especialidades</h2>
        <div className="specialties-grid">
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Cardiologia} alt="Especialidad Cardiologia" />
            </div>
            <h3>Cardiología</h3>
            <p>Cuida tu corazón con nuestros expertos en cardiología.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Nutricion} alt="Nutricion" />
            </div>
            <h3>Nutrición</h3>
            <p>Mejora tu salud alimenticia con nuestros especialistas en nutrición.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Pediatra} alt="Pediatra" />
            </div>
            <h3>Pediatría</h3>
            <p>El mejor cuidado para la salud de los más pequeños.</p>
          </div>
        </div>

      </section>
      <section className="testimonial-section">
        <div className="container-testimonial">
          <div className="panel-info">
            <h2 className="section-title">Testimonios de Pacientes</h2>
          </div>
          <div className="panel-body">
            <textarea className='form-control' name="" id="#txtArea" rows="3"></textarea>
            <br />
            <button className="btn-post">Publicar</button>
            <hr />

            <ul className="media-list">
              <li className="media-body">
                <span className="txt-muted">
                  <small className="txt-mtd">hace 30 min</small>
                </span>
                <strong className="txt-succes"> @BorysCode</strong>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </li>
              <li className="media-body">
                <span className="txt-muted">
                  <small className="txt-mtd">hace 1 dias</small>
                </span>
                <strong className="txt-succes"> @MarioBruzzone</strong>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </li>
              <li className="media-body">
                <span className="txt-muted">
                  <small className="txt-mtd">hace 2 dias</small>
                </span>
                <strong className="txt-succes"> @BorysCode</strong>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </li>
            </ul>
          </div>



        </div>

      </section>
    </div>
  );
};

export default Home;