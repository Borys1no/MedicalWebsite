import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar funciones de Firebase Storage
import { storage, db } from '../../../Firebase/firebase'; // Tu configuración de Firebase
import { collection, addDoc } from 'firebase/firestore'; // Importar funciones de Firestore
import './TransferPayment.css';

const TransferPayment = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleConfirm = async () => {
    if (selectedFile) {
      try {
        // Generar un nombre único para el archivo
        const uniqueFileName = `${Date.now()}_${selectedFile.name}`;
        const fileRef = ref(storage, `comprobantes/${uniqueFileName}`);
        
        // Subir el archivo a Firebase Storage
        await uploadBytes(fileRef, selectedFile);

        // Obtener la URL del archivo subido
        const downloadURL = await getDownloadURL(fileRef);

        // Guardar la URL y otros detalles en Firestore
        const docRef = await addDoc(collection(db, 'appointments'), {
          fileName: uniqueFileName,
          fileURL: downloadURL,
          timestamp: new Date(),
        });

        console.log("Comprobante guardado en Firestore con ID:", docRef.id);
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
