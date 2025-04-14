import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PasarelaPago from '../PasarelaPago/PasarelaPago';
import './checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  // Estado para controlar la visibilidad de la pasarela de pago
  const [showPasarela, setShowPasarela] = useState(false);

  const handleConfirmClicktransfer = () => {
    // Redirigir a la pasarela de transferencia con los detalles de la cita
    navigate('/Pagotransferencia', {
      state: {
        startTime,
        endTime,
        email,
      },
    });
  };

  // Función para mostrar la pasarela de pago
  const handleDebitCreditClick = () => {
    setShowPasarela(true); // Mostrar la pasarela de pago
  };

  return (
    <div className="checkout-container">
      <h1>Confirmación de Cita</h1>
      <div className="checkout-details">
        {startTime ? (
          <>
            <p><strong>Fecha y Hora de Inicio:</strong> {new Date(startTime).toLocaleString()}</p>
            <p><strong>Fecha y Hora de Fin:</strong> {new Date(endTime).toLocaleString()}</p>
            <p><strong>Precio:</strong> $50.00</p>
          </>
        ) : (
          <p>No se encontró información sobre la cita. Por favor, intenta nuevamente.</p>
        )}
      </div>
      <div className="checkout-actions">
        <button className="checkout-confirm-btn" onClick={handleDebitCreditClick}>Débito/Crédito</button>
        <button className="checkout-confirm-btn" onClick={handleConfirmClicktransfer}>Transferencia</button>
        <button className="checkout-cancel-btn" onClick={() => navigate('/home')}>Cancelar</button>
      </div>
      {/* Contenedor para la pasarela de pago */}
      {showPasarela && (
        <div className="pasarela-container">
          <PasarelaPago location={{ state }} />
        </div>
      )}
    </div>
  );
};

export default Checkout;