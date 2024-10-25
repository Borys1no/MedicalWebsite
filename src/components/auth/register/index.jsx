import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../Firebase/auth';
import './register.css'; 

const Register = () => {
    const navigate = useNavigate();
    const [tipoDocumento, setTipoDocumento] = useState('cedula');
    const [identificacion, setIdentificacion] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [pais, setPais] = useState('');
    const [provincia, setProvincia] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [direccion, setDireccion] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    const [email, setEmail] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { userLoggedIn } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        // Aquí irá la lógica de verificación y registro como en la versión previa.
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="R-main">
                <div className="R-container">
                    <div className="R-header">
                        <h3 className="R-title">Crea una Nueva Cuenta</h3>
                    </div>
                    <form onSubmit={onSubmit} className="R-form">
                        <div className="R-form-group">
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
                        <div className="R-form-group">
                            <label className="R-label">Número de Identificación</label>
                            <input
                                type="text"
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Nombres</label>
                            <input
                                type="text"
                                value={nombres}
                                onChange={(e) => setNombres(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Apellidos</label>
                            <input
                                type="text"
                                value={apellidos}
                                onChange={(e) => setApellidos(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">País</label>
                            <select
                                value={pais}
                                onChange={(e) => setPais(e.target.value)}
                                className="R-input"
                                required
                            >
                                <option value="">Seleccione un país</option>
                                <option value="Ecuador">Ecuador</option>
                                <option value="Colombia">Colombia</option>
                                <option value="Peru">Perú</option>
                                {/* Agrega más países aquí */}
                            </select>
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Provincia</label>
                            <input
                                type="text"
                                value={provincia}
                                onChange={(e) => setProvincia(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Ciudad</label>
                            <input
                                type="text"
                                value={ciudad}
                                onChange={(e) => setCiudad(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Dirección</label>
                            <input
                                type="text"
                                value={direccion}
                                onChange={(e) => setDireccion(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Código Postal</label>
                            <input
                                type="text"
                                value={codigoPostal}
                                onChange={(e) => setCodigoPostal(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Teléfono</label>
                            <input
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="R-input"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div className="R-form-group">
                            <label className="R-label">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="R-input"
                                required
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
