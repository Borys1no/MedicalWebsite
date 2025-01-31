import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../Firebase/firebase'; // Importar Firebase
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios'; // Para llamar al microservicio de Zoom
import './PasarelaPago.css';

const PasarelaPago = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  const [data, setData] = useState({
    PayboxRemail: 'agenda.reumasur@gmail.com',
    PayboxSendmail: email || 'correo_cliente@example.com', // Usar el correo del usuario
    PayboxRename: 'Emilio Aroca Briones Briones',
    PayboxSendname: 'Nombre Cliente',
    PayboxBase0: '1.00',
    PayboxBase12: '2.00',
    PayboxDescription: 'Pago de Servicios Médicos',
    PayboxProduction: false,
    PayboxEnvironment: 'sandbox',
    PayboxLanguage: 'es',
    PayboxPagoPlux: true,
    PayboxDirection: 'Boyaca entre Colón y Tarqui - Machala-Ecuador',
    PayBoxClientPhone: '1234567890',
  });

  const [scriptLoaded, setScriptLoaded] = useState(false); // Estado para controlar si el script ya se cargó
  const [onAuthorizeDefined, setOnAuthorizeDefined] = useState(false); // Estado para controlar si onAuthorize ya se definió

  // Cargar el script de PagoPlux dinámicamente
  useEffect(() => {
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = 'https://sandbox-paybox.pagoplux.com/paybox/index.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true); // Marcar que el script se cargó
      };
      script.onerror = () => {
        console.error("Error al cargar el script de PagoPlux.");
      };
      document.body.appendChild(script);

      // Limpiar el script cuando el componente se desmonte
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [scriptLoaded]);

  // Definir la función onAuthorize solo una vez
  useEffect(() => {
    if (scriptLoaded && !onAuthorizeDefined) {
      window.onAuthorize = async function (response) {
        if (response.status === 'succeeded') {
          // Pago exitoso
          alert("Pago exitoso. La cita ha sido agendada.");

          // Agendar la cita en Firebase
          try {
            const newDoc = await addDoc(collection(db, 'citas'), {
              userId: email, // Usar el correo como identificador
              email: email,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
            });

            // Llamar al microservicio de Zoom para crear la reunión y enviar el correo
            try {
              const zoomResponse = await axios.post('https://zoommicroservice-production.up.railway.app/create-appointment', {
                userEmail: email,
                startTime: new Date(startTime).toISOString(),
              });

              alert("Se ha enviado un correo con el enlace de Zoom.");
            } catch (zoomError) {
              console.error('Error al crear la reunión de Zoom:', zoomError);
              alert("La cita fue agendada, pero ocurrió un problema al crear la reunión de Zoom.");
            }

            // Redirigir a una página de confirmación o al home
            navigate('/home');
          } catch (firebaseError) {
            console.error('Error al agendar la cita en Firebase:', firebaseError);
            alert("Ocurrió un error al agendar la cita. Por favor, inténtelo de nuevo.");
          }
        } else {
          // Pago fallido
          alert("Pago fallido. Por favor, inténtelo de nuevo.");
        }
      };

      setOnAuthorizeDefined(true); // Marcar que onAuthorize ya se definió
    }
  }, [scriptLoaded, onAuthorizeDefined, email, startTime, endTime, navigate]);

  const handlePayment = () => {
    if (window.Data) {
      window.Data.init(data);
    } else {
      console.error("Data no está definido.");
    }
  };

  return (
    <div className="pasarela-pago-container">
      <h1>Pago con Tarjeta</h1>
      <div id="modalPaybox"></div>
      <button
        className='buttonpay'
        id="pay"
        type="button"
        onClick={handlePayment}
      >
        Pagar
      </button>
    </div>
  );
};

export default PasarelaPago;