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
            const newDoc = await addDoc(collection(db, 'citas'), {
              userId: email,
              email: email,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
            });

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

            navigate('/home');
          } catch (firebaseError) {
            console.error('Error al agendar la cita en Firebase:', firebaseError);
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