import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function AuthForm() {
  // Estado para manejar si es login o registro
  const [isLogin, setIsLogin] = useState(true);

  // Estados compartidos para login y registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados adicionales para el registro
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [numeroTelefono, setNumeroTelefono] = useState("");

  // Función para manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuario inició sesión: ", userCredential.user);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Función para manejar el registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuario registrado: ", userCredential.user);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Iniciar Sesión" : "Registro de Usuario"}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
            />
            <input
              type="text"
              placeholder="Número de Teléfono"
              value={numeroTelefono}
              onChange={(e) => setNumeroTelefono(e.target.value)}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
      </form>

      <div>
        {isLogin ? (
          <>
            <p>¿No tienes una cuenta?</p>
            <button onClick={() => setIsLogin(false)}>Registrarse</button>
          </>
        ) : (
          <>
            <p>¿Ya tienes una cuenta?</p>
            <button onClick={() => setIsLogin(true)}>Iniciar Sesión</button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
