import React, { useState, useEffect } from 'react';
import './PasarelaPago.css';

const PasarelaPago = () => {
  const [data, setData] = useState({
    PayboxRemail: 'tu_correo_registrado@dominio.com',
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
    if (!window.Data) {
      console.error("El script de PagoPlux no se cargó correctamente.");
    }
  }, []);

  const handlePayment = () => {
    console.log("Intentando iniciar el pago con los siguientes datos:", data);
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
      <button className='buttonpay' id="pay" type="button" onClick={handlePayment} />
    </div>
  );
};

export default PasarelaPago;
