import React, { useState } from 'react';
import './PasarelaPago.css';

const PasarelaPago = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const handlePayment = () => {
    // Aquí se manejará el envío de la información a Datafast
    alert("Procesando el pago...");
  };

  return (
    <div className="pasarela-pago-container">
      <h1>Pago con Tarjeta</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handlePayment();
      }}>
        <div className="input-group">
          <label htmlFor="cardNumber">Número de Tarjeta</label>
          <input 
            type="text"
            id="cardNumber"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="expiryDate">Fecha de Expiración</label>
          <input 
            type="text"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="MM/AA"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cvv">CVV</label>
          <input 
            type="text"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cardHolder">Nombre del Titular</label>
          <input 
            type="text"
            id="cardHolder"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="pay-button">Pagar</button>
      </form>
    </div>
  );
};

export default PasarelaPago;
