import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../../Firebase/auth';
import { useAuth } from '../../../contexts/authContext';
import { db } from '../../../Firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
    
                // Intentar iniciar sesión con email y password
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
                    
                    if (role === 'admin') {
                        navigate('/dashboard/AdminHome');
                    } else {
                        navigate('/home');
                    }
                } else {
                    setErrorMessage("No se encontró el rol del usuario.");
                }
            } catch (error) {
                console.error("Error en el inicio de sesión:", error);
                setErrorMessage("Error en el inicio de sesión: " + error.message);
            } finally {
                setIsSigningIn(false);
            }
        }
    };
    
    
    
    


    const onGoogleSignIn = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithGoogle();
            } catch (error) {
                setErrorMessage(error.message);
                setIsSigningIn(false);
            }
        }
    };
    if (loading) {
        return <div>Cargando...</div>
    }


    return (
        <div>
            {userLoggedIn && <Navigate to="/home" replace />}

            <main className="L-main">
                <div className="L-container">
                    <div className="L-textCenter">
                        <h3 className="L-title">Welcome Back</h3>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="L-label">Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="L-input"
                            />
                        </div>

                        <div>
                            <label className="L-label">Password</label>
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
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="L-textCenter L-textSm">
                        Don't have an account? <Link to="/register" className="L-link">Sign up</Link>
                    </div>

                    <div className="L-orDivider">
                        <span>OR</span>
                    </div>

                    <button
                        disabled={isSigningIn}
                        onClick={onGoogleSignIn}
                        className={`L-googleBtn ${isSigningIn ? 'L-googleBtnDisabled' : ''}`}
                    >
                        Continue with Google
                    </button>
                </div>
            </main>
        </div>
    );

};

export default Login;
