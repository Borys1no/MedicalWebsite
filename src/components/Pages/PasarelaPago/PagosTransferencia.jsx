import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, storage } from "../../../Firebase/firebase";
import { ref, uploadBytes, getDownloadURL, getMetadata } from "firebase/storage";
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
        const userEmail = auth.currentUser.email;
        const fileName = `${Date.now()}_${comprobante.name.replace(/\s+/g, '_')}`;
        
        // 1. Referencia al archivo en Storage
        const storageRef = ref(storage, `comprobantes/${userId}/${fileName}`);
        
        // 2. Subir archivo con metadatos extendidos
        const uploadResult = await uploadBytes(storageRef, comprobante, {
          contentType: comprobante.type,
          customMetadata: {
            uploadedBy: userId,
            userEmail: userEmail,
            appointmentDate: startTime.toISOString(),
            originalFileName: comprobante.name,
            status: 'pending_review'
          }
        });
    
        // 3. Obtener URL y metadatos
        const comprobanteUrl = await getDownloadURL(storageRef);
        const fileMetadata = await getMetadata(storageRef);
        
        // 4. Guardar en Firestore con estructura completa
        const citaData = {
          paciente: { 
            email: userEmail,
            uid: userId,
            nombre: auth.currentUser.displayName || 'Usuario no identificado'
          },
          fechaCita: {
            start: new Date(startTime),
            end: new Date(endTime),
            fechaString: new Date(startTime).toLocaleDateString('es-ES')
          },
          estado: 'pendiente',
          pago: {
            metodo: 'transferencia',
            comprobante: {
              url: comprobanteUrl,
              path: uploadResult.metadata.fullPath,
              nombreArchivo: comprobante.name,
              tipoArchivo: comprobante.type,
              metadata: fileMetadata.customMetadata,
              fechaSubida: new Date()
            },
            verificacion: {
              estado: false,
              revisadoPor: null,
              fechaRevision: null
            }
          },
          metadata: {
            creadoEl: new Date(),
            ultimaActualizacion: new Date()
          }
        };

        await addDoc(collection(db, 'citas'), citaData);

        // 5. Notificación y redirección
        await Swal.fire({
          title: '¡Comprobante cargado exitosamente!',
          html: `
            <div>
              <p>En las próximas horas le confirmaremos la cita por correo electrónico.</p>
              <p><small>Referencia: ${fileName}</small></p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          willClose: () => navigate('/home')
        });
        
      } catch (error) {
        console.error('Error al subir:', error);
        Swal.fire({
          title: 'Error',
          text: `No se pudo subir el comprobante: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Reintentar'
        });
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
          inputProps={{ accept: 'image/*,.pdf,.doc,.docx' }}
        />
  
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || !comprobante}
          fullWidth
          sx={{ mt: 2 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Procesando...' : 'Enviar Comprobante'}
        </Button>
      </Box>
    );
};
  
export default PagoTransferencia;