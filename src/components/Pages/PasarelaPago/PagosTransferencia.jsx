import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, storage } from "../../../Firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { Button, TextField, Box, CircularProgress, Typography } from '@mui/material';
import Swal from 'sweetalert2';

const PagoTransferencia = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const { startTime, endTime, email } = state || {};
  
    const [comprobante, setComprobante] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const handleFileChange = (e) => {
      setComprobante(e.target.files[0]);
    };
  
    const handleSubmit = async () => {
      if (!comprobante) {
        Swal.fire('Error', 'Debes subir un comprobante', 'error');
        return;
      }
    
      setLoading(true);
      try {
        if (!auth.currentUser) {
          throw new Error('Usuario no autenticado');
        }
    
        const userId = auth.currentUser.uid;
        const fileName = `${Date.now()}_${comprobante.name.replace(/\s+/g, '_')}`;
        
        const storageRef = ref(storage, `comprobantes/${userId}/${fileName}`);
        
        await uploadBytes(storageRef, comprobante, {
          contentType: comprobante.type,
          customMetadata: {
            uploadedBy: userId,
            originalName: comprobante.name
          }
        });
    
        const comprobanteUrl = await getDownloadURL(storageRef);
        
        // Guardar la cita en Firestore
        await addDoc(collection(db, 'citas'), {
          paciente: { 
            email: email,
            uid: userId 
          },
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          estado: 'pendiente',
          pago: {
            metodo: 'transferencia',
            comprobanteUrl,
            verificacion: false,
            fechaSubida: new Date()
          }
        });

        // Notificación de éxito con SweetAlert2
        await Swal.fire({
          title: '¡Comprobante cargado exitosamente!',
          text: 'En las próximas horas le confirmaremos la cita por correo electrónico.',
          icon: 'success',
          confirmButtonText: 'Entendido',
          timer: 5000, // Cierra automáticamente después de 5 segundos
          timerProgressBar: true,
          willClose: () => {
            navigate('/home'); // Redirección al home
          }
        });

        // Redirección por si el usuario no cierra manualmente la alerta
        setTimeout(() => {
          navigate('/home');
        }, 5000);
        
      } catch (error) {
        console.error('Error al subir:', error);
        Swal.fire('Error', `No se pudo subir el comprobante: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Box sx={{ maxWidth: 500, mx: 'auto', p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Pago por Transferencia
        </Typography>
        <Typography paragraph>
          Por favor sube el comprobante de transferencia. Tu cita se activará después de la verificación.
        </Typography>
  
        <TextField
          type="file"
          fullWidth
          margin="normal"
          onChange={handleFileChange}
          inputProps={{ accept: 'image/*,.pdf' }}
        />
  
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !comprobante}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Enviar Comprobante'}
        </Button>
      </Box>
    );
};
  
export default PagoTransferencia;