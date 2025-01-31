import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  const handleConfirmClick = () => {
    // Redirigir a la pasarela de pago con los detalles de la cita
    navigate('/cn', {
      state: {
        startTime,
        endTime,
        email,
      },
    });
  };

  const handleConfirmClicktransfer = () => {
    // Redirigir a la pasarela de transferencia con los detalles de la cita
    navigate('/transfer', {
      state: {
        startTime,
        endTime,
        email,
      },
    });
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
        <button className="checkout-confirm-btn" onClick={handleConfirmClick}>Débito/Crédito</button>
        <button className="checkout-confirm-btn" onClick={handleConfirmClicktransfer}>Transferencia</button>
        <button className="checkout-cancel-btn" onClick={() => navigate('/home')}>Cancelar</button>
      </div>
    </div>
  );
};

export default Checkout;