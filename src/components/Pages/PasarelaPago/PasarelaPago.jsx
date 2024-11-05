import React, { useState } from 'react';
import axios from 'axios';
import './PasarelaPago.css';

const PasarelaPago = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    // Validaciones previas al envío
    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
      setErrorMessage('Número de tarjeta inválido');
      setIsProcessing(false);
      return;
    }
    if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
      setErrorMessage('CVV inválido');
      setIsProcessing(false);
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
      setErrorMessage('Fecha de expiración inválida');
      setIsProcessing(false);
      return;
    }

    try {
      const paymentData = {
        card_number: cardNumber,
        card_expiry: expiryDate,
        cvv,
        card_holder: cardHolder,
        amount: 50.00,
        currency: 'USD',
      };

      const response = await axios.post('https://sandbox.datafast.com.ec/api/pagos', paymentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer TU_TOKEN_DE_API_AQUÍ',
        },
      });

      if (response.status === 200) {
        alert('Pago exitoso. Gracias por tu compra.');
      } else {
        setErrorMessage('Error al procesar el pago. Intenta de nuevo más tarde.');
      }
    } catch (error) {
      console.error('Error al procesar el pago: ', error);
      setErrorMessage('Ocurrió un problema al procesar tu pago. Verifica los datos e intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    setExpiryDate(value);
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
            maxLength="16"
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))} // Solo dígitos
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="expiryDate">Fecha de Expiración</label>
          <input 
            type="text"
            id="expiryDate"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            placeholder="MM/AA"
            maxLength="5"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="cvv">CVV</label>
          <input 
            type="text"
            id="cvv"
            value={cvv}
            maxLength="4"
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} // Solo dígitos
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="pay-button" disabled={isProcessing}>
          {isProcessing ? 'Procesando...' : 'Pagar'}
        </button>
      </form>
    </div>
  );
};

export default PasarelaPago;
