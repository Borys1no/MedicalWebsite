import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { Navigate } from 'react-router-dom';
import { db } from '../../../Firebase/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import './ProfileC.css';

const ProfileC = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        // Obtener los datos del usuario desde Firebase
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        setProfileData(userDoc.data());
                    } else {
                        console.error("No se encontró el documento de usuario.");
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del perfil:", error);
                }
            }
        };

        // Obtener y actualizar las citas agendadas del usuario actual
        const fetchAndCheckAppointments = async () => {
            if (currentUser) {
                try {
                    const appointmentsRef = collection(db, 'citas');
                    const q = query(appointmentsRef, where('userId', '==', currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedAppointments = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    const currentTime = new Date();

                    // Verificar y actualizar el estado de las citas pasadas
                    const updatedAppointments = await Promise.all(
                        fetchedAppointments.map(async (appointment) => {
                            const endTime = new Date(appointment.endTime.seconds * 1000);
                            if (endTime < currentTime && appointment.status === 'Agendada') {
                                // Actualizar el estado en Firebase
                                await updateDoc(doc(db, 'citas', appointment.id), {
                                    status: 'Completada'
                                });
                                return { ...appointment, status: 'Completada' };
                            }
                            return appointment;
                        })
                    );

                    setAppointments(updatedAppointments);
                } catch (error) {
                    console.error("Error al obtener las citas:", error);
                }
            }
        };

        fetchUserData();
        fetchAndCheckAppointments();
    }, [currentUser]);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="profile-page">
            {/* Bloque de perfil */}
            <div className="profile-container">
                <h1>Perfil de Usuario</h1>
                {profileData ? (
                    <div className="profile-details">
                        <p><strong>Nombre:</strong> {profileData.firstName} {profileData.lastName}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>Fecha de Nacimiento:</strong> {profileData.birthDate}</p>
                        <p><strong>Teléfono:</strong> {profileData.phoneNumber}</p>
                        <p><strong>Dirección:</strong> {profileData.address}, {profileData.city}, {profileData.province}, {profileData.country}</p>
                        <p><strong>Código Postal:</strong> {profileData.postalCode}</p>
                        <p><strong>Tipo de Documento:</strong> {profileData.documentType}</p>
                        <p><strong>Número de Identificación:</strong> {profileData.identificationNumber}</p>
                        <p><strong>Fecha de Creación:</strong> {new Date(profileData.createdAt.seconds * 1000).toLocaleString()}</p>
                    </div>
                ) : (
                    <p>Cargando datos del perfil...</p>
                )}
            </div>

            {/* Bloque de citas */}
            <div className="appointments-container">
                <h2>Mis Citas</h2>
                {appointments.length > 0 ? (
                    <ul>
                        {appointments.map((appointment) => (
                            <li key={appointment.id}>
                                <p><strong>Fecha:</strong> {new Date(appointment.startTime.seconds * 1000).toLocaleString()}</p>
                                <p><strong>Hora de Fin:</strong> {new Date(appointment.endTime.seconds * 1000).toLocaleString()}</p>
                                <p><strong>Estado:</strong> {appointment.status}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aún no se han agendado ninguna cita.</p>
                )}
            </div>
        </div>
    );
};

export default ProfileC;
