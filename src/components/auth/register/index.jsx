import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../../Firebase/auth';
<<<<<<< HEAD
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
=======
import { db } from '../../../Firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import './register.css'; // Importa los estilos

const Register = () => {
    const navigate = useNavigate();
    const [identificationNumber, setIdentificationNumber] = useState('');
    const [documentType, setDocumentType] = useState('cedula');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [birthDate, setBirthDate] = useState('');
>>>>>>> refs/remotes/origin/master
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
<<<<<<< HEAD
=======
    const [phoneNumber, setPhoneNumber] = useState('');
>>>>>>> refs/remotes/origin/master
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { userLoggedIn } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
<<<<<<< HEAD
        // Aquí irá la lógica de verificación y registro como en la versión previa.
=======

        if (password !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        setErrorMessage(''); // Limpia el mensaje de error antes de intentar registrar
        if (!isRegistering) {
            setIsRegistering(true);
            try {
                // Crear el usuario con Firebase Authentication
                const userCredential = await doCreateUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Crear el documento del usuario en Firestore
                await setDoc(doc(db, "users", user.uid), {
                    identificationNumber,
                    documentType,
                    firstName,
                    lastName,
                    country,
                    province,
                    city,
                    address,
                    postalCode,
                    birthDate,
                    email,
                    phoneNumber,
                    createdAt: new Date(),
                });

                console.log("Registro exitoso y documento de usuario creado en Firestore");
                navigate('/home'); // Redirigir a la página de inicio después del registro exitoso
            } catch (error) {
                console.error("Error al registrar usuario: ", error);
                setErrorMessage("Hubo un problema al registrar el usuario. Por favor, intente de nuevo.");
            }
            setIsRegistering(false);
        }
>>>>>>> refs/remotes/origin/master
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="R-main">
                <div className="R-container">
                    <div className="R-header">
                        <h3 className="R-title">Crea una Nueva Cuenta</h3>
                    </div>
<<<<<<< HEAD
                    <form onSubmit={onSubmit} className="R-form">
                        <div className="R-form-group">
=======
                    <form onSubmit={onSubmit} className="R-form R-form-grid">
                        <div>
>>>>>>> refs/remotes/origin/master
                            <label className="R-label">Tipo de Documento</label>
                            <select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                className="R-input"
                                required
                            >
                                <option value="cedula">Cédula</option>
                                <option value="ruc">RUC</option>
                                <option value="pasaporte">Pasaporte</option>
                            </select>
                        </div>
<<<<<<< HEAD
                        <div className="R-form-group">
                            <label className="R-label">Número de Identificación</label>
                            <input
                                type="text"
                                value={identificacion}
                                onChange={(e) => setIdentificacion(e.target.value)}
=======
                        <div>
                            <label className="R-label">Número de Identificación</label>
                            <input
                                type="text"
                                value={identificationNumber}
                                onChange={(e) => setIdentificationNumber(e.target.value)}
>>>>>>> refs/remotes/origin/master
                                className="R-input"
                                required
                            />
                        </div>
<<<<<<< HEAD
                        <div className="R-form-group">
                            <label className="R-label">Nombres</label>
                            <input
                                type="text"
                                value={nombres}
                                onChange={(e) => setNombres(e.target.value)}
=======
                        <div>
                            <label className="R-label">Nombres</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
>>>>>>> refs/remotes/origin/master
                                className="R-input"
                                required
                            />
                        </div>
<<<<<<< HEAD
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
=======
                        <div>
                            <label className="R-label">Apellidos</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">País</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">Provincia</label>
                            <input
                                type="text"
                                value={province}
                                onChange={(e) => setProvince(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">Ciudad</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">Dirección</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="R-label">Código Postal</label>
                            <input
                                type="text"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
>>>>>>> refs/remotes/origin/master
                            <label className="R-label">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
<<<<<<< HEAD
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
=======
                        <div>
                            <label className="R-label">Teléfono</label>
                            <input
                                type="tel"
                                pattern="[0-9]{10}"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
                        <div>
>>>>>>> refs/remotes/origin/master
                            <label className="R-label">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="R-input"
                                required
                            />
                        </div>
<<<<<<< HEAD
                        <div className="R-form-group">
=======
                        <div>
>>>>>>> refs/remotes/origin/master
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
