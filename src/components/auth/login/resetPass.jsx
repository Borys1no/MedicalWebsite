import React from 'react'
import { useState } from 'react'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import e from 'cors';
import Swal from 'sweetalert2';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';


function ResetPassword (){
    const [email, setEmail]= useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) =>{
        e.preventDefault();
        const auth = getAuth();

        try{
            await sendPasswordResetEmail(auth, email);
            Swal.fire({
                title: 'Restablecer contraseña.',
                html: 'Revisa tu correo para restablecer la contraseña.',
                icon: 'info',
                confirmButtonText: 'Entendido'

            });

        } catch (err){
            Swal.fire({
                title: 'Restablecer contraseña.',
                html: ' No se pudo enviar el correo. Verifica el email ingresado.',
                icon: 'info',
                confirmButtonText: 'Entendido'
            });
        }
    };

    return (
    <Box maxWidth={400} mx="auto" mt={5} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>
        Recuperar contraseña
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 2 }}
        >
          Enviar correo de recuperación
        </Button>
      </form>

      {mensaje && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
export default ResetPassword;
