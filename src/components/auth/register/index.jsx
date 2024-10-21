import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../Firebase/auth';
import './register.css'; // Importa los estilos

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { userLoggedIn } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isRegistering) {
            setIsRegistering(true);
            await doCreateUserWithEmailAndPassword(email, password);
        }
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="R-main">
                <div className="R-container">
                    <div className="R-header">
                        <div className="mt-2">
                            <h3 className="R-title">Crea una Nueva Cuenta</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="R-form">
                        <div>
                            <label className="R-label">Correo electrónico</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        <div>
                            <label className="R-label">Contraseña</label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        <div>
                            <label className="R-label">Confirmar Contraseña</label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete="off"
                                required
                                value={confirmPassword}
                                onChange={(e) => setconfirmPassword(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        {errorMessage && <span className="R-errorMessage">{errorMessage}</span>}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`R-button ${isRegistering ? 'R-buttonDisabled' : ''}`}
                        >
                            {isRegistering ? 'Registrando...' : 'Registrar'}
                        </button>
                        <div className="R-textCenter">
                            ¿Ya tienes una cuenta? {' '}
                            <Link to="/login" className="R-link">Continuar</Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Register;
