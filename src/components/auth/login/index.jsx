import React, { useState, useEffect } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { doSignInWithEmailAndPassword } from "../../../Firebase/auth";
import { useAuth } from "../../../contexts/authContext";
import { db } from "../../../Firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "./login.css";

const Login = () => {
  const auth = useAuth();
  const userLoggedIn = auth?.userLoggedIn;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState("prompt");
  const [locationAlertShown, setLocationAlertShown] = useState(false);

  const detectUserCountry = async () => {
    try {
      // Verificar soporte de geolocalización
      if (!navigator.geolocation) {
        throw new Error("GEOLOCATION_UNSUPPORTED");
      }

      // Verificar estado del permiso
      let permissionState = "prompt";
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
          permissionState = permissionStatus.state;
          setLocationPermission(permissionState);
        } catch (e) {
          console.log("API de Permissions no soportada completamente");
        }
      }

      // Mostrar alerta solo si es necesario
      const shouldShowAlert = (
        permissionState === "prompt" || 
        (permissionState === "denied" && !locationAlertShown)
      );

      if (shouldShowAlert && localStorage.getItem('dontShowLocationAlert') !== 'true') {
        await Swal.fire({
          title: 'Mejora tu experiencia',
          html: 'Para ofrecerte un mejor servicio, necesitamos acceder a tu ubicación.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          showCancelButton: permissionState === 'denied',
          cancelButtonText: 'No mostrar de nuevo'
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            localStorage.setItem('dontShowLocationAlert', 'true');
          }
        });
        setLocationAlertShown(true);
      }

      // Intentar obtener ubicación
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { timeout: 10000, enableHighAccuracy: true }
        );
      });

      // Obtener país desde coordenadas
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
      );
      const data = await response.json();
      return data.address?.country || null;

    } catch (error) {
      console.error("Error en geolocalización:", error);
      
      // Manejar permiso denegado
      if (error.code === error.PERMISSION_DENIED) {
        setLocationPermission("denied");
      }

      // Fallback: Obtener país por IP (usando un proxy CORS)
      try {
        // Usamos un proxy CORS para evitar problemas
        const ipResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://ipapi.co/json/')}`);
        const ipData = await ipResponse.json();
        const parsedData = JSON.parse(ipData.contents);
        return parsedData.country || null;
      } catch (ipError) {
        console.error("Error al obtener país por IP:", ipError);
        return null;
      }
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Cargar estado de alerta previo
        const alertShown = localStorage.getItem('locationAlertShown') === 'true';
        setLocationAlertShown(alertShown);

        // Si hay usuario autenticado, obtener su rol
        if (auth?.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          }
        }
        
        // Obtener ubicación (no bloqueante)
        detectUserCountry()
          .then(country => {
            if (country) {
              setUserLocation(country === 'Ecuador' ? "EC" : "foreign");
            }
          })
          .catch(error => console.error("Error obteniendo ubicación:", error));

      } catch (error) {
        console.error("Error inicializando:", error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    initialize();
  }, [auth]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        const userCredential = await doSignInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (!user) {
          throw new Error("Error: No se pudo autenticar al usuario");
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
          const role = userDoc.data().role;
          let finalLocation = userLocation;
          
          if (!finalLocation) {
            const detectedCountry = await detectUserCountry();
            finalLocation = detectedCountry === 'Ecuador' ? "EC" : "foreign";
          }

          await updateDoc(doc(db, 'users', user.uid), {
            ubication: finalLocation,
            lastLocationUpdate: new Date()
          });

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
        });
        setErrorMessage("Error en el inicio de sesión: Usuario o contraseña incorrectos.");
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  if (userLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div>
      <main className="L-main">
        {locationPermission === "denied" && (
          <div className="location-warning">
            <p>Para una mejor experiencia, por favor habilita los permisos de ubicación en tu navegador.</p>
          </div>
        )}
        
        <div className="L-container">
          <div className="L-textCenter">
            <h3 className="L-title">Bienvenido de nuevo</h3>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div style={{ marginBottom: "20px" }}>
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

            <div style={{ marginBottom: "30px" }}>
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

            {errorMessage && (
              <span className="L-errorMessage">{errorMessage}</span>
            )}

            <button
              type="submit"
              disabled={isSigningIn}
              className={`L-button ${isSigningIn ? "L-buttonDisabled" : ""}`}
              style={{ marginBottom: "30px" }}
            >
              {isSigningIn ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="L-textCenter L-textSm">
            ¿No tienes una cuenta?{" "}
            <Link to="/Resgister" className="L-link">
              Regístrate
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;