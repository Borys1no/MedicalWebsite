import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../Firebase/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import Swal from "sweetalert2";
import "./PasarelaPago.css";

const PasarelaPago = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { startTime, endTime, email } = state || {};

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    ubication: "EC",
  });
  const [price, setPrice] = useState(100); // valor por defecto
  const [loadingUserData, setLoadingUserData] = useState(true);

  const [data, setData] = useState({
    PayboxRemail: "agenda.reumasur@gmail.com",
    PayboxSendmail: email || "correo_cliente@example.com",
    PayboxRename: "Emilio Aroca Briones Briones",
    PayboxSendname: "Nombre Cliente",
    PayboxBase0: "0.00",
    PayboxBase12: "0.00",
    PayboxDescription: "Pago de Servicios Médicos",
    PayboxProduction: false,
    PayboxEnvironment: "sandbox",
    PayboxLanguage: "es",
    PayboxPagoPlux: true,
    PayboxDirection: "Boyaca entre Colón y Tarqui - Machala-Ecuador",
    PayBoxClientPhone: "1234567890",
  });

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [onAuthorizeDefined, setOnAuthorizeDefined] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const payButtonRef = useRef(null);

  // Obtener datos del usuario y establecer precio
  useEffect(() => {
    const fetchUserDataAndPrice = async () => {
      if (!email) {
        console.error("Error: Email no proporcionado");
        setLoadingUserData(false);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setLoadingUserData(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        const userCountry = user.ubication || "EC";
        const userPrice = userCountry === "EC" ? 100 : 150;

        const updatedUserData = {
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          ubication: userCountry,
        };

        setUserData(updatedUserData);
        setPrice(userPrice);

        // Actualizar estado del pago
        setData((prev) => ({
          ...prev,
          PayboxBase12: userPrice.toFixed(2),
          PayboxSendmail: email,
          PayboxSendname:
            `${updatedUserData.firstName} ${updatedUserData.lastName}`.trim() ||
            "Cliente",
          PayBoxClientPhone: updatedUserData.phoneNumber || "Sin teléfono",
        }));
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserDataAndPrice();
  }, [email]);

  // Cargar el script de PagoPlux
  useEffect(() => {
    if (
      !scriptLoaded &&
      !document.querySelector(
        'script[src="https://sandbox-paybox.pagoplux.com/paybox/index.js"]'
      )
    ) {
      const script = document.createElement("script");
      script.src = "https://sandbox-paybox.pagoplux.com/paybox/index.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () =>
        console.error("Error al cargar el script de PagoPlux.");
      document.body.appendChild(script);
    }
  }, [scriptLoaded]);

  // Definir función global onAuthorize
  useEffect(() => {
    if (scriptLoaded && !onAuthorizeDefined && !loadingUserData) {
      window.onAuthorize = async function (response) {
        if (response.status === "succeeded") {
          if (!email || !startTime || !endTime) {
            throw new Error("Faltan datos esenciales para agendar la cita");
          }
          try {
            const userTimeZone =
              Intl.DateTimeFormat().resolvedOptions().timeZone;
            const zoomResponse = await axios.post(
              "https://zoommicroservice-production.up.railway.app/create-appointment",
              {
                userEmail: email,
                startTime: new Date(startTime).toISOString(),
                userTimeZone,
              }
            );

            const zoomLink = zoomResponse.data.zoomLink;

            const citaData = {
              paciente: { ...userData, email },
              timeZone: userTimeZone,
              fechaCita: new Date(startTime),
              startTime: new Date(startTime),
              endTime: new Date(endTime),
              zoomLink,
              estado: "confirmada",
              pago: {
                status: "completado",
                fecha: new Date(),
                metodo: "PagoPlux",
                respuesta: response,
              },
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            };

            await addDoc(collection(db, "citas"), citaData);
            Swal.fire({
              title: "Éxito",
              text: "Pago exitoso y cita agendada correctamente",
              icon: "success",
              confirmButtonText: "Entendido",
              willClose: () => navigate("/home"),
            });
          } catch (error) {
            console.error("Error al agendar la cita:", error);
            Swal.fire({
              title: "Error",
              text: `No se pudo procesar tu solicitud: ${error.message}`,
              icon: "error",
              confirmButtonText: "Entendido",
            });
          }
        } else {
          Swal.fire({
            title: "Error",
            text: "El pago no fue exitoso. Por favor, inténtalo de nuevo.",
            icon: "error",
            confirmButtonText: "Entendido",
          });
        }
      };

      setOnAuthorizeDefined(true);
    }
  }, [
    scriptLoaded,
    onAuthorizeDefined,
    email,
    startTime,
    endTime,
    navigate,
    userData,
    loadingUserData,
  ]);

  // Verifica si todo está listo para disparar el pago
  useEffect(() => {
    if (scriptLoaded && onAuthorizeDefined && !loadingUserData) {
      setIsReady(true);
    }
  }, [scriptLoaded, onAuthorizeDefined, loadingUserData]);

  useEffect(() => {
    if (isReady && payButtonRef.current) {
      payButtonRef.current.click();
    }
  }, [isReady]);

  const handlePayment = () => {
    if (window.Data) {
      window.Data.init(data);
    } else {
      console.error(
        "Data no está definido. Asegúrate de que el script de PagoPlux esté cargado."
      );
    }
  };

  return (
    <div className="pasarela-pago-container">
      {loadingUserData ? (
        <div className="loading-message">Cargando datos del usuario...</div>
      ) : (
        <>
          <h1>Pago con Tarjeta</h1>
          <div id="modalPaybox"></div>
          <button
            id="pay"
            className="buttonpay"
            onClick={handlePayment}
            disabled={!isReady || loadingUserData}
            ref={payButtonRef}
          >
            {loadingUserData ? "Cargando..." : "Pagar"}
          </button>
        </>
      )}
    </div>
  );
};

export default PasarelaPago;
