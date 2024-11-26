import React, { useState } from 'react';
import './TransferPayment.css';

const TransferPayment = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      alert('Comprobante subido correctamente. Pago en revisión.');
      // Aquí puedes manejar la subida del archivo a Firebase o tu servidor
    } else {
      alert('Por favor, selecciona un archivo antes de confirmar.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
  };

  return (
    <div className="T-transferPage-container">
      <h1>Pagar por Transferencia</h1>
      <div className="T-uploadSection">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="T-fileInput"
        />
        <div className="T-preview">
          {selectedFile ? (
            <p>Archivo seleccionado: {selectedFile.name}</p>
          ) : (
            <p>No se ha seleccionado ningún archivo.</p>
          )}
        </div>
        <div className="T-buttons">
          <button className="T-confirmButton" onClick={handleConfirm}>
            Confirmar
          </button>
          <button className="T-resetButton" onClick={handleReset}>
            Subir de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPayment;
