import { useState, useEffect } from 'react';
import { db } from '../Firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import axios from 'axios';

export const usePayment = (email, startTime, endTime, navigate) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [onAuthorizeDefined, setOnAuthorizeDefined] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Carga el script de PagoPlux
  useEffect(() => {
    if (!scriptLoaded && !document.querySelector('script[src="https://sandbox-paybox.pagoplux.com/paybox/index.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://sandbox-paybox.pagoplux.com/paybox/index.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => console.error("Error al cargar el script de PagoPlux.");
      document.body.appendChild(script);
    }
  }, [scriptLoaded]);

  // Define onAuthorize en el ámbito global
  useEffect(() => {
    if (scriptLoaded && !onAuthorizeDefined) {
      console.log("Definiendo la función onAuthorize...");

      window.onAuthorize = async function (response) {
        console.log("Respuesta del pago:", response);

        if (response.status === 'succeeded') {
          alert("Pago exitoso. La cita ha sido agendada.");

          try {
            // Crear la reunión de Zoom
            const zoomResponse = await axios.post('https://zoommicroservice-production.up.railway.app/create-appointment', {
              userEmail: email,
              startTime: new Date(startTime).toISOString(),
            });

            const zoomLink = zoomResponse.data.zoomLink; // Extraer el enlace de Zoom

            // Guardar la cita en Firebase con el enlace de Zoom
            const newDoc = await addDoc(collection(db, 'citas'), {
              userId: email,
              email: email,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              zoomLink: zoomLink, // Guardar el enlace de Zoom
              status: 'agendada', // Estado de la cita
            });

            alert("Se ha enviado un correo con el enlace de Zoom.");
            navigate('/home');
          } catch (error) {
            console.error('Error al agendar la cita:', error);
            alert("Ocurrió un error al agendar la cita. Por favor, inténtelo de nuevo.");
          }
        } else {
          alert("Pago fallido. Por favor, inténtelo de nuevo.");
        }
      };

      setOnAuthorizeDefined(true);
    }
  }, [scriptLoaded, onAuthorizeDefined, email, startTime, endTime, navigate]);

  // Marca que el script está listo
  useEffect(() => {
    if (scriptLoaded && onAuthorizeDefined) {
      setIsReady(true);
    }
  }, [scriptLoaded, onAuthorizeDefined]);

  return { isReady };
};