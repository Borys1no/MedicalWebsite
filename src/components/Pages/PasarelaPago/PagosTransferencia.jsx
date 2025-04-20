import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db, storage } from "../../../Firebase/firebase";
import { ref, uploadBytes, getDownloadURL, getMetadata } from "firebase/storage";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Button, TextField, Box, CircularProgress, Typography } from '@mui/material';
import Swal from 'sweetalert2';
import axios from 'axios';

const PagoTransferencia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  const [comprobante, setComprobante] = useState(null);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state || !startTime || !endTime || !email) {
      Swal.fire({
        title: 'Datos incompletos',
        text: 'No se encontraron datos de la cita. Intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Volver al inicio'
      }).then(() => navigate('/home'));
      return;
    }

    const obtenerUsuario = async () => {
      try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.error("Usuario no encontrado");
          return;
        }

        const user = snapshot.docs[0].data();

        setUserData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || ''
        });
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, [email, state]);

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
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const fileName = `${userId}_${Date.now()}_${comprobante.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `comprobantes/${userId}/${fileName}`);

      const uploadResult = await uploadBytes(storageRef, comprobante, {
        contentType: comprobante.type,
        customMetadata: {
          uploadedBy: userId,
          userEmail: userEmail,
          appointmentDate: new Date(startTime).toISOString(),
          originalFileName: comprobante.name,
          status: 'pending_review'
        }
      });

      const comprobanteUrl = await getDownloadURL(storageRef);
      const fileMetadata = await getMetadata(storageRef);

      // Guardar en Firestore
      const citaData = {
        paciente: {
          email: userEmail,
          uid: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber
        },
        timeZone: userTimeZone,
        fechaCita: {
          start: new Date(startTime),
          end: new Date(endTime),
          fechaString: new Date(startTime).toLocaleDateString('es-ES')
        },
        estado: 'pendiente_verificacion', // Nuevo estado
        pago: {
          metodo: 'transferencia',
          status: 'pendiente',
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
      console.error('Error al subir comprobante o crear cita:', error);
      Swal.fire({
        title: 'Error',
        text: `No se pudo procesar tu solicitud: ${error.message}`,
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

      {comprobante && (
        <Typography variant="body2" color="textSecondary">
          Archivo seleccionado: {comprobante.name}
        </Typography>
      )}

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
