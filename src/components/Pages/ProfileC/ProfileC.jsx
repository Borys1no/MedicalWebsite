import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { Navigate } from 'react-router-dom';
import { db } from '../../../Firebase/firebase';
import { collection, query, where, getDocs, doc, or, getDoc } from 'firebase/firestore';
import './ProfileC.css';

const ProfileC = () => {
    const { currentUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [appointments, setAppointments] = useState([]);

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
                }
            }
        };

        const fetchAppointments = async () => {
            if (currentUser) {
                try {
                    const appointmentsRef = collection(db, 'citas');
                    const q = query(
                        appointmentsRef,
                        or(
                            where('paciente.uid', '==', currentUser.uid),
                            where('paciente.email', '==', currentUser.email),
                            where('email', '==', currentUser.email)
                        )
                    );

                    const querySnapshot = await getDocs(q);
                    
                    const fetchedAppointments = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        
                        // Manejo de fechas
                        let startTime, endTime;
                        
                        if (data.fechaCita?.start) {
                            startTime = data.fechaCita.start.toDate();
                            endTime = data.fechaCita.end.toDate();
                        } else if (data.startTime) {
                            startTime = data.startTime.toDate();
                            endTime = data.endTime.toDate();
                        } else {
                            startTime = new Date(data.metadata?.appointmentDate || new Date());
                            endTime = new Date(startTime.getTime() + 3600000); // +1 hora
                        }

                        return {
                            id: doc.id,
                            ...data,
                            startTime,
                            endTime,
                            zoomLink: data.zoomLink || null
                        };
                    });

                    setAppointments(fetchedAppointments);
                } catch (error) {
                    console.error("Error al obtener citas:", error);
                }
            }
        };

        fetchUserData();
        fetchAppointments();
    }, [currentUser]);

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Función para formatear fecha y hora
    const formatDateTime = (date) => {
        return date.toLocaleString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>Perfil de Usuario</h1>
                {profileData && (
                    <div className="profile-details">
                        <p><strong>Nombre:</strong> {profileData.firstName} {profileData.lastName}</p>
                        <p><strong>Email:</strong> {profileData.email}</p>
                        <p><strong>Teléfono:</strong> {profileData.phoneNumber}</p>
                    </div>
                )}
            </div>

            <div className="appointments-container">
                <h2>Mis Citas</h2>
                {appointments.length > 0 ? (
                    <ul className="appointments-list">
                        {appointments.map((appointment) => (
                            <li key={appointment.id} className="appointment-card">
                                <h3>Cita Médica</h3>
                                <p><strong>Fecha:</strong> {formatDateTime(appointment.startTime)}</p>
                                <p><strong>Duración:</strong> 1 hora</p>
                                {appointment.zoomLink && (
                                    <div className="zoom-link-container">
                                        <a 
                                            href={appointment.zoomLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="zoom-link-button"
                                        >
                                            Unirse a la consulta por Zoom
                                        </a>
                                        <p className="zoom-notice">El enlace estará activo 10 minutos antes de la cita</p>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No tienes citas programadas actualmente.</p>
                )}
            </div>
        </div>
    );
};

export default ProfileC;