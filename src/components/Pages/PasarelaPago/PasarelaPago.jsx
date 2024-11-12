import React, { useState, useEffect } from 'react';
import './PasarelaPago.css';

const PasarelaPago = () => {
  const [data, setData] = useState({
    PayboxRemail: 'tu_correo_registrado@dominio.com', // Cambia este valor a tu correo registrado en PagoPlux
    PayboxSendmail: 'correo_cliente@example.com',
    PayboxRename: 'Nombre del Establecimiento',
    PayboxSendname: 'Nombre Cliente',
    PayboxBase0: '10.00',
    PayboxBase12: '12.00',
    PayboxDescription: 'Pago de Servicios Médicos',
    PayboxProduction: false,
    PayboxEnvironment: 'sandbox',
    PayboxLanguage: 'es',
    PayboxPagoPlux: true,
    PayboxDirection: 'Dirección del Cliente',
    PayBoxClientPhone: '1234567890',
  });

  useEffect(() => {
    // Asegurarse de que el script esté cargado, sin inicializar datos aún
    if (!window.Data) {
      console.error("El script de PagoPlux no se cargó correctamente.");
    }
  }, []);

  const handlePayment = () => {
    console.log("Intentando iniciar el pago con los siguientes datos:", data); // Verifica que los datos estén completos
    if (window.Data) {
      window.Data.init(data); // Llamada directa a Data.init
    } else {
      console.error("Data no está definido.");
    }
  };

  return (
    <div className="pasarela-pago-container">
      <h1>Pago con Tarjeta</h1>
      {/* Div para el modal de PagoPlux */}
      <div id="modalPaybox"></div>
      {/* Botón de pago con el estilo recomendado */}
      <button
        id="pay"
        type="button"
        onClick={handlePayment}
        style={{
          display: 'inline-block',
          backgroundColor: '#FAFAFA',
          right: '80px',
          position: 'fixed',
          backgroundImage: 'url(https://sandbox-paybox.pagoplux.com/img/pagar.png?v1)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          height: '96px',
          width: '215px',
          border: 'none',
          cursor: 'pointer',
          backgroundSize: 'contain',
          outline: '0',
        }}
      >
        {/* El texto es opcional */}
      </button>
    </div>
  );
};

export default PasarelaPago;
