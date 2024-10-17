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
            <p className="banner-subtitle" style={{ marginBottom: '60px' }} >Alivio tu dolor, Mejoro tu calidad de vida.</p>
            <a href="#" className="btn-primary">Agenda tu Cita Médica</a>
          </div>
        </div>
      </header>
      <section className="info-buttons-section">
        <div className="info-background-image">
          <img src={assets.Doctorsonriendo} alt="Doctor Sonriendo" className="background-image" />
        </div>
        <div className="info-buttons-container">
          <div className="info-buttons-list">
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Traumatología" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Artritis</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Reumatología" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Artrosis</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Psicología Clínica" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Lupus</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Terapia de Lenguaje" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Osteoporosis</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Psiquiatría" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Dolores articulares</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
            <div className="info-button-card">
              <img src={assets.Doctor} alt="Pediatría" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Reumatología Pediátria</h3>
                <p>Ver especialidad &rarr;</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="specialties-section">
        <h2 className="section-title" style={{ marginBottom: '50px' }}>Lo mejor para tu salud</h2>
        <div className="specialties-grid">
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Cardiologia} alt="Especialidad Cardiologia" />
            </div>
            <h3>Reumatólogo-Internista</h3>
            <p className="specialty-description">Médico especializado en diagnosticar y tratar enfermedades articulares y del sistema inmune, con enfoque integral en la salud general del paciente.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Nutricion} alt="Nutricion" />
            </div>
            <h3>Terapista Neural</h3>
            <p className="specialty-description">Especialista que utiliza terapia neural para tratar el dolor y otros problemas de salud mediante la estimulación del sistema nervioso.</p>
          </div>
          <div className="specialty-card">
            <div className="icon-placeholder">
              <img src={assets.Doctor} alt="Pediatra" />
            </div>
            <h3>Médico Biorregulador y Funcional</h3>
            <p className="specialty-description">Profesional que busca equilibrar y restaurar las funciones naturales del cuerpo usando tratamientos integrativos y personalizados.</p>
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