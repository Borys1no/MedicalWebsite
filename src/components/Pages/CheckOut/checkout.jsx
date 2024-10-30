import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importar para obtener los datos de la cita y navegar
import './checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  // Extraer información de la cita desde el estado
  const { appointmentId, startTime, endTime } = state || {};

  const handleConfirmClick = () => {
    // Redirigir a la pasarela de pago
    navigate('/cn');
  };

  return (
    <div className="checkout-container">
      <h1>Confirmación de Cita</h1>
      <div className="checkout-details">
        {appointmentId ? (
          <>
            <p><strong>ID de la Cita:</strong> {appointmentId}</p>
            <p><strong>Fecha y Hora de Inicio:</strong> {new Date(startTime).toLocaleString()}</p>
            <p><strong>Fecha y Hora de Fin:</strong> {new Date(endTime).toLocaleString()}</p>
            <p><strong>Precio:</strong> $50.00</p> {/* Precio fijo por ahora */}
          </>
        ) : (
          <p>No se encontró información sobre la cita. Por favor, intenta nuevamente.</p>
        )}
      </div>
      <div className="checkout-actions">
        <button className="checkout-confirm-btn" onClick={handleConfirmClick}>Confirmar Cita</button>
        <button className="checkout-cancel-btn">Cancelar</button>
      </div>
    </div>
  );
};

export default Checkout;
