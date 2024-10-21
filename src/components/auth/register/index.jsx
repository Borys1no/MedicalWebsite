import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../Firebase/auth';
import { db } from '../../../Firebase/firebase'; // Asegúrate de importar la instancia de Firestore
import { doc, setDoc } from 'firebase/firestore';
import './register.css'; // Importa los estilos

const Register = () => {
    const navigate = useNavigate();
    const [tipoDocumento, setTipoDocumento] = useState('cedula');
    const [identificacion, setIdentificacion] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { userLoggedIn } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }

        if (!isRegistering) {
            setIsRegistering(true);
            try {
                const userCredential = await doCreateUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Guardar los datos adicionales en Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    tipoDocumento,
                    identificacion,
                    nombres,
                    apellidos,
                    email,
                    fechaNacimiento,
                    telefono
                });

                navigate('/home');
            } catch (error) {
                setErrorMessage('Error al registrar: ' + error.message);
                console.error("Error al registrar usuario:", error);
            } finally {
                setIsRegistering(false);
            }
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
                            <label className="R-label">Tipo de Documento</label>
                            <select
                                value={tipoDocumento}
                                onChange={(e) => setTipoDocumento(e.target.value)}
                                className="R-input"
                            >
                                <option value="cedula">Cédula</option>
                                <option value="pasaporte">Pasaporte</option>
                            </select>
                        </div>

                        <div>
                            <label className="R-label">Número de Identificación</label>
                            <input
                                type="text"
                                required
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        <div>
                            <label className="R-label">Nombres</label>
                            <input
                                type="text"
                                required
                                value={nombres}
                                onChange={(e) => setNombres(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        <div>
                            <label className="R-label">Apellidos</label>
                            <input
                                type="text"
                                required
                                value={apellidos}
                                onChange={(e) => setApellidos(e.target.value)}
                                className="R-input"
                            />
                        </div>

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
                            <label className="R-label">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                required
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                className="R-input"
                            />
                        </div>

                        <div>
                            <label className="R-label">Teléfono</label>
                            <input
                                type="tel"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                required
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
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
