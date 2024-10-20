import React, { useState } from 'react';
import './Home.css';
import { assets } from '../../../assets/assets';

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');

  const handleCardClick = (content) => {
    setPopupContent(content);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="banner">
          <img src={assets.Banner} alt="Banner" />
          <div className="banner-content">
            <h1 className="banner-title">Cuida tu salud a cualquier hora</h1>
            <p className="banner-subtitle" style={{ marginBottom: '60px' }}>Alivio tu dolor, Mejoro tu calidad de vida.</p>
            <a href="#" className="btn-primary">Agenda tu Cita Médica</a>
          </div>
        </div>
      </header>
      <section className="info-buttons-section">
        <div className="info-background-image">
          <img src={assets.ConsultoriaIA} alt="Doctor Sonriendo" className="background-image" />
        </div>
        <div className="info-buttons-container">
          <div className="info-buttons-list">
            <div className="info-button-card" onClick={() => handleCardClick('La artritis es una enfermedad caracterizada por la inflamación de las articulaciones, lo que produce dolor, hinchazón y limitación en el movimiento. Existen diferentes tipos de artritis, siendo los más comunes la osteoartritis y la artritis reumatoide. Esta afección puede presentarse en personas de cualquier edad y su manejo adecuado es fundamental para mejorar la calidad de vida del paciente.')}>              <img src={assets.arrowRightCircle} alt="Traumatología" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Artritis</h3>
                <p>Ver más</p>
              </div>
            </div>
            <div className="info-button-card" onClick={() => handleCardClick('La artrosis es una enfermedad degenerativa que afecta las articulaciones, produciendo el desgaste del cartílago que las recubre, lo que genera dolor, rigidez y pérdida de movilidad. Es más frecuente en personas mayores y suele afectar principalmente rodillas, caderas, manos y columna. Un diagnóstico y tratamiento oportunos son esenciales para aliviar los síntomas y mejorar la calidad de vida del paciente.')}>              <img src={assets.arrowRightCircle} alt="Reumatología" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Artrosis</h3>
                <p>Ver más</p>
              </div>
            </div>
            <div className="info-button-card" onClick={() => handleCardClick('El lupus es una enfermedad autoinmunitaria crónica en la que el sistema inmunológico ataca por error tejidos y órganos del propio cuerpo, lo que provoca inflamación y daños en diversas partes, como la piel, las articulaciones, los riñones y el corazón. Es una afección compleja, cuyos síntomas varían de persona a persona, y requiere un tratamiento adecuado para controlar la enfermedad y mejorar la calidad de vida del paciente.')}>              <img src={assets.arrowRightCircle} alt="Psicología Clínica" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Lupus</h3>
                <p>Ver más</p>
              </div>
            </div>
            <div className="info-button-card" onClick={() => handleCardClick('La osteoporosis es una enfermedad que debilita los huesos, haciéndolos más frágiles y propensos a fracturas. Se produce cuando la densidad ósea disminuye, afectando especialmente a mujeres posmenopáusicas y personas de edad avanzada. Un diagnóstico precoz y un tratamiento adecuado son clave para prevenir fracturas y mantener una buena calidad de vida.')}>              <img src={assets.arrowRightCircle} alt="Terapia de Lenguaje" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Osteoporosis</h3>
                <p>Ver más</p>
              </div>
            </div>
            <div className="info-button-card" onClick={() => handleCardClick('Los dolores articulares son molestias o dolores que se sienten en una o más articulaciones del cuerpo. Pueden ser causados por diversas afecciones, como artritis, lesiones o infecciones, y su intensidad varía desde leve hasta incapacitante. Un diagnóstico adecuado es fundamental para identificar la causa subyacente y ofrecer el tratamiento más adecuado para aliviar los síntomas y mejorar la movilidad del paciente.')}>              <img src={assets.arrowRightCircle} alt="Psiquiatría" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Dolores articulares</h3>
                <p>Ver más</p>
              </div>
            </div>
            <div className="info-button-card" onClick={() => handleCardClick('La reumatología pediátrica es una rama de la medicina que se encarga del diagnóstico y tratamiento de enfermedades reumáticas en niños y adolescentes. Estas enfermedades, que afectan principalmente las articulaciones, músculos y huesos, incluyen condiciones como la artritis juvenil, el lupus y otras enfermedades autoinmunes. Un tratamiento temprano es esencial para mejorar la calidad de vida y el pronóstico a largo plazo de los pacientes jóvenes.')}>              <img src={assets.arrowRightCircle} alt="Pediatría" className="info-icon-left" />
              <div className="info-button-text">
                <h3>Reumatología Pediátrica</h3>
                <p>Ver más</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showPopup && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup" onClick={handleClosePopup}>X</button>
            <h2>¿Qué es?</h2>
            <div className="popup-body">
              <p>{popupContent}</p>
              <img src={assets.lightbulb} alt="Doctor" className="popup-image" />
            </div>
          </div>
        </div>
      )}
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
