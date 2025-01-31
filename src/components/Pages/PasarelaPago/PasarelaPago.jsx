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

  useEffect(() => {
    console.log("Inicializando PagoPlux...");

    // Definir la función onAuthorize que maneja la respuesta del pago
    window.onAuthorize = async function (response) {
      console.log("Respuesta del pago recibida:", response);

      if (response.status === 'succeeded') {
        // Pago exitoso
        console.log("Pago exitoso:", response);
        alert("Pago exitoso. La cita ha sido agendada.");

        // Agendar la cita en Firebase
        try {
          console.log("Agendando cita en Firebase...");
          const newDoc = await addDoc(collection(db, 'citas'), {
            userId: email, // Usar el correo como identificador
            email: email,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
          });

          console.log("Cita agendada en Firebase con ID:", newDoc.id);

          // Llamar al microservicio de Zoom para crear la reunión y enviar el correo
          try {
            console.log("Creando reunión de Zoom...");
            const zoomResponse = await axios.post('https://zoommicroservice-production.up.railway.app/create-appointment', {
              userEmail: email,
              startTime: new Date(startTime).toISOString(),
            });

            console.log('Reunión de Zoom creada exitosamente:', zoomResponse.data);
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
        console.error("Pago fallido:", response);
        alert("Pago fallido. Por favor, inténtelo de nuevo.");
      }
    };

    // Verificar que el script de PagoPlux se cargó correctamente
    if (!window.Data) {
      console.error("El script de PagoPlux no se cargó correctamente.");
    } else {
      console.log("PagoPlux cargado correctamente.");
    }
  }, [email, startTime, endTime, navigate]);

  const handlePayment = () => {
    console.log("Intentando iniciar el pago con los siguientes datos:", data);

    if (window.Data) {
      console.log("Iniciando pago con PagoPlux...");
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