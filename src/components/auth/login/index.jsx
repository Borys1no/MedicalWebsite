import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { doSignInWithEmailAndPassword } from '../../../Firebase/auth';
import { useAuth } from '../../../contexts/authContext';
import { db } from '../../../Firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import './login.css'; // Importa los estilos

const Login = () => {
    const auth = useAuth();
    const userLoggedIn = auth?.userLoggedIn;
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState(null);
    const [userCountry, setUserCountry] = useState(null);


    const detectUserCountry = async () =>{
        try{
            const position = await new Promise((resolve, reject)=>{
                navigator.geolocation.getCurrentPosition(resolve, reject,{
                    timeout: 5000,
                    enableHighAccuracy: true
                });
            });
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            return data.address?.country || null;
        }catch (geoError){
            console.error("Geolocalización falló, intentando por IP...");
        }
        try{
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData =await ipResponse.json();
            return ipData.country || null;
        }catch (ipError){
            console.error("Error al obtener el país por IP:", ipError);
            return null; 
        }
    }

    useEffect(() => {
        if (auth?.currentUser) {
            const fetchUserRole = async () => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error al obtener el rol del usuario ", error);
                    setErrorMessage("Error al obtener el rol del usuario");
                    setLoading(false);
                }
            };
            fetchUserRole();
        } else {
            setLoading(false);
        }
    }, [auth]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!isSigningIn) {
            setIsSigningIn(true);
            try {

                // Intentar iniciar sesión con email y contraseña
                const userCredential = await doSignInWithEmailAndPassword(email, password);

                // Verificar si el usuario está autenticado
                const user = userCredential.user;

                if (!user) {
                    throw new Error("Error: No se pudo autenticar al usuario");
                }

                // Obtener el documento de Firestore con el UID del usuario
                const userDoc = await getDoc(doc(db, 'users', user.uid));


                if (userDoc.exists()) {
                    const role = userDoc.data().role;
                    //Detectar el país del usuario
                    const detectedCountry = await detectUserCountry();
                    const isEcuador = detectedCountry === 'Ecuador';
                    setUserCountry(isEcuador ? "EC" : "foreign");

                    //Actualizar el país del usuario en Firestore
                    await updateDoc(doc(db, 'users', user.uid), {
                        ubication: isEcuador ? "EC" : "foreign",
                        lastLocationUpdate: new Date()
                    });

                    // Redirigir según el rol del usuario
                    if (role === 'admin') {
                        navigate('/dashboard/AdminHome');
                    } else {
                        navigate('/home');
                    }
                } else {
                    setErrorMessage("No se encontró el rol del usuario.");
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al iniciar sesión: Usuario o contraseña incorrectos.'

                })
                setErrorMessage("Error en el inicio de sesión: Usuario o contraseña incorrectos. ");
            } finally {
                setIsSigningIn(false);
            }
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            {userLoggedIn && <Navigate to="/home" replace />}

            <main className="L-main">
                <div className="L-container">
                    <div className="L-textCenter">
                        <h3 className="L-title">Bienvenido de nuevo</h3>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div style={{ marginBottom: '20px' }}>
                            <label className="L-label">Correo electrónico</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="L-input"
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label className="L-label">Contraseña</label>
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="L-input"
                            />
                        </div>

                        {errorMessage && <span className="L-errorMessage">{errorMessage}</span>}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`L-button ${isSigningIn ? 'L-buttonDisabled' : ''}`}
                            style={{ marginBottom: '30px' }}  // Estilo actualizado
                        >
                            {isSigningIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>

                    <div className="L-textCenter L-textSm">
                        ¿No tienes una cuenta? <Link to="/Resgister" className="L-link">Regístrate</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
