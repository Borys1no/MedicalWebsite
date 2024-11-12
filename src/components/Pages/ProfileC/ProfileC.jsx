import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { Navigate } from 'react-router-dom';
import { db } from '../../../Firebase/firebase'; // Importa la referencia a tu base de datos de Firebase
import { doc, getDoc } from 'firebase/firestore'; // Importa los métodos necesarios de Firebase
import './ProfileC.css';

const ProfileC = () => {
    const { currentUser } = useAuth(); // Datos del usuario autenticado
    const [profileData, setProfileData] = useState(null); // Estado para los datos del perfil

    useEffect(() => {
        // Obtener los datos del usuario desde Firebase
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid); // Ajusta el nombre de la colección si es necesario
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

        fetchUserData();
    }, [currentUser]);

    if (!currentUser) {
        // Redirigir al login si no hay usuario autenticado
        return <Navigate to="/login" />;
    }

    return (
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
    );
};

export default ProfileC;
