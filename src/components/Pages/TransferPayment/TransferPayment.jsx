import React, { useState } from 'react';
import { ref, uploadBytes } from "firebase/storage";
import { getAuth } from 'firebase/auth'; // Importa la autenticación de Firebase
import { storage } from '../../../Firebase/firebase';
import './TransferPayment.css';

const TransferPayment = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleConfirm = async () => {
    const auth = getAuth(); // Obtén la instancia de autenticación
    if (!auth.currentUser) {
      console.error('El usuario no está autenticado.');
      alert('Por favor, inicia sesión para subir el archivo.');
      return;
    }

    if (selectedFile) {
      try {
        const fileName = `${Date.now()}_${selectedFile.name}`; // Genera un nombre único
        const fileRef = ref(storage, `comprobantes/${fileName}`);

        // Subir archivo
        await uploadBytes(fileRef, selectedFile);

        alert('Comprobante subido correctamente. Pago en revisión.');
      } catch (error) {
        console.error("Error al subir el comprobante:", error);
        alert('Hubo un error al subir el comprobante. Inténtalo de nuevo.');
      }
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
