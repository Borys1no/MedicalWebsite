import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { Navigate } from 'react-router-dom';
import { db } from '../../../Firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Divider,
} from '@mui/material';

const ProfileSettings = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setProfileData(userDoc.data());
                    }
                } catch (error) {
                    console.error("Error al obtener datos del perfil:", error);
                    showErrorAlert("Error al cargar los datos del perfil");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const showSuccessAlert = (message) => {
        Swal.fire({
            title: '¡Éxito!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
    };

    const showErrorAlert = (message) => {
        Swal.fire({
            title: 'Error',
            text: message,
            icon: 'error',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!profileData.firstName.trim()) errors.firstName = 'El nombre es requerido';
        if (!profileData.lastName.trim()) errors.lastName = 'El apellido es requerido';
        if (profileData.phoneNumber && !/^[0-9+\-\s]+$/.test(profileData.phoneNumber)) {
            errors.phoneNumber = 'Número de teléfono inválido';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phoneNumber: profileData.phoneNumber
            });

            showSuccessAlert("Perfil actualizado correctamente");
            setEditMode(false);
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            showErrorAlert("Error al actualizar el perfil. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (loading && !profileData.firstName) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                    Configuración del Perfil
                </Typography>

                {!editMode ? (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Nombre
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {profileData.firstName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Apellido
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {profileData.lastName}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {profileData.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" color="textSecondary">
                                    Teléfono
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {profileData.phoneNumber || 'No proporcionado'}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setEditMode(true)}
                                sx={{ textTransform: 'none' }}
                            >
                                Editar Perfil
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    name="firstName"
                                    value={profileData.firstName}
                                    onChange={handleInputChange}
                                    error={!!formErrors.firstName}
                                    helperText={formErrors.firstName}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Apellido"
                                    name="lastName"
                                    value={profileData.lastName}
                                    onChange={handleInputChange}
                                    error={!!formErrors.lastName}
                                    helperText={formErrors.lastName}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleInputChange}
                                    disabled
                                    helperText="Para cambiar tu email, contacta con soporte"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="phoneNumber"
                                    value={profileData.phoneNumber || ''}
                                    onChange={handleInputChange}
                                    error={!!formErrors.phoneNumber}
                                    helperText={formErrors.phoneNumber}
                                    placeholder="Ej: +34 600 000 000"
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                    setEditMode(false);
                                    setFormErrors({});
                                }}
                                sx={{ textTransform: 'none' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ProfileSettings;