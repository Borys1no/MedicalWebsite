import  { useState, useEffect } from 'react';
import './Home.css';
import { assets } from '../../../assets/assets';
import Carousel from './Carousel';

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);



  const handleCardClick = (content) => {
    setPopupContent(content);0
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };
  const services = [
    { icon: <img src={assets.iDoctor} alt='Icono doctor' />, title: "Atencion de punta", subtitle: "Recibe la mejor atencion de parte de nuestros profesionales", description: "En REUMASUR nos preocupamos por brindarte una atencion de calidad, nos preocupamos por tu bienestar y salud" },
    { icon: <img src={assets.esteto} alt='Icono doctor' />, title: "Cuidados Personalizados", subtitle: "Recibe una atencion personalizada y dedicada, ajustada a tus necesidades", description: "En REUMASUR nos enfocamos en ti,ofreciendo cuidados integrales que priorizan tu salud y comodidad en cada paso del proceso" },
    { icon: <img src={assets.medico} alt='Icono doctor' />, title: "Compromiso con tu Bienestar", subtitle: "Nuestro equipo de expertos está aquí para acompañarte en tu camino hacia una mejor salud.", description: "En REUMASUR, tu bienestar es nuestra misión. Nos comprometemos a brindarte el apoyo y la atención que necesitas para una vida más saludable." },

  ];

  const items = [
    { image: assets.oficial1, text: 'Médico especializado en diagnosticar y tratar enfermedades articulares y del sistema inmune, con enfoque integral en la salud general del paciente.' },
    { image: assets.oficial2, text: 'Especialista que utiliza terapia neural para tratar el dolor y otros problemas de salud mediante la estimulación del sistema nervioso.' },
    { image: assets.oficial3, text: 'Profesional que busca equilibrar y restaurar las funciones naturales del cuerpo usando tratamientos integrativos y personalizados.' },
  ];

  const whatsapp =[
    {
      phoneNumber: '593985340336',
      message: '¡Hola! Me gustaría obtener más información.'

    },
  ];

  const {phoneNumber, message}= whatsapp[0];

  /*
  const carouselItems = [
    {
      
      title: 'Reumatólogo-Internista',
      description: 'Médico especializado en diagnosticar y tratar enfermedades articulares y del sistema inmune, con enfoque integral en la salud general del paciente.'
    },
    {
      
      title: 'Terapista Neural',
      description: 'Especialista que utiliza terapia neural para tratar el dolor y otros problemas de salud mediante la estimulación del sistema nervioso.'
    },
    {
      
      title: 'Médico Biorregulador y Funcional',
      description: 'Profesional que busca equilibrar y restaurar las funciones naturales del cuerpo usando tratamientos integrativos y personalizados.'
    }
  ];
*/


  return (
    <div className="home-container">
      <div className="whatsapp-button">
        <a 
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        >
          <img src={assets.WhatAppIcon} alt="WhatsApp"/>
        </a>

      </div>
      <div className="home-header">
        <img src={assets.Banner} alt="Banner image" className="banner-image" />

        <header className="home-content">
          <div className="logo">
            <span>REUMA<span className="sur">SUR</span></span>
          </div>


        </header>

        <main className="main-content">
          <h1 className="banner-title">Cuida tu salud a cualquier hora</h1>
          <p className="banner-subtitle" style={{ marginBottom: '60px' }}>Alivio tu dolor, Mejoro tu calidad de vida.</p>
          <a href="/AgendarCita" className="btn-primary">Agenda tu Cita Médica</a>
        </main>

      </div>


      <section className="info-buttons-section">


        <div className="info-background-image">
          <img src={assets.ConsultoriaIA} alt="Doctor Sonriendo" className="background-image" />
        </div>
        <div className="espe">
          <h2 className="subTitle" style={{ marginBottom: '50px' }}>
            Nuestras especializaciones
          </h2>

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
        <div className="services-section">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <h4>{service.subtitle}</h4>
              <p>{service.description}</p>
            </div>

          ))}
        </div>
        <section className="carousel-section">
          <Carousel items={items} />
              {/* 
              <div className="carousel-content">
                <h2>{carouselItems[currentIndex].title}</h2>
                <p>{carouselItems[currentIndex].description}</p>
              </div>
              */}
        </section>

        <div className="parent">
          <div className="div1">
            <img src={assets.oficial4} alt="Foto del medico" />
          </div>
          <div className="div2">
            <h2>Dr. Emilio Aroca Briones</h2>
            <span>Terapista Neural, Médico Funcional
              26 años de experiencia a tu servicio
              Especializado en el Hospital Britanico de Buenos Aires Argentina,
              y Hospital Universitario Reina Sofia. Cordoba - Espania
            </span>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
