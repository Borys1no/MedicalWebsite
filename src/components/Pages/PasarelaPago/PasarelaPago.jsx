import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePayment } from "../../../hooks/UsePayment";
import "./PasarelaPago.css";

const PasarelaPago = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  const [data, setData] = useState({
    PayboxRemail: 'agenda.reumasur@gmail.com',
    PayboxSendmail: email || 'correo_cliente@example.com',
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

  const { isReady } = usePayment(email, startTime, endTime, navigate);
  const payButtonRef = useRef(null);

  useEffect(() => {
    if (isReady && payButtonRef.current) {
      payButtonRef.current.click();
    }
  }, [isReady]);

  const handlePayment = () => {
    if (window.Data) {
      console.log("Iniciando proceso de pago con los siguientes datos:", data);
      window.Data.init(data);
    } else {
      console.error("Data no está definido. Asegúrate de que el script de PagoPlux esté cargado.");
    }
  };

  return (
    <div className="pasarela-pago-container">
      <h1>Pago con Tarjeta</h1>
      <div id="modalPaybox"></div>
      <button
        id="pay"
        className="buttonpay"
        onClick={handlePayment}
        disabled={!isReady}
        ref={payButtonRef}
      >
        Pagar
      </button>
    </div>
  );
};

export default PasarelaPago;