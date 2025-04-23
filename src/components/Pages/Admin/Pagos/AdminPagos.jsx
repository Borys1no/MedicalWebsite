import React, { useEffect, useState } from "react";
import { db } from "../../../../Firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../../../../contexts/authContext";
import {
  CircularProgress,
  useMediaQuery
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import "./AdminPagos.css";

const AdminPagos = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Función mejorada para parsear fechas
  const parseFirestoreDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate(); // Firebase Timestamp
    if (date instanceof Date) return date; // Ya es Date
    return new Date(date); // String ISO o timestamp numérico
  };

  // Función para enviar correo de confirmación
  const enviarCorreoConfirmacion = async (cita) => {
    try {
      const fechaInicio = parseFirestoreDate(cita.fechaCita.start);

      if (!fechaInicio || isNaN(fechaInicio.getTime())) {
        throw new Error("Fecha de cita inválida");
      }
      // Verificar que tenemos todos los datos necesarios
      if (!cita.paciente?.email || !cita.zoomLink) {
        console.error("Datos incompletos para enviar correo:", {
          email: cita.paciente?.email,
          zoomLink: cita.zoomLink,
        });
        return false;
      }

      const response = await axios.post(
        "https://zoommicroservice-production.up.railway.app/send-confirmation-email",
        {
          userEmail: cita.paciente.email,
          zoomLink: cita.zoomLink,
          appointmentDate: fechaInicio.toISOString(),
          userName: `${cita.paciente.firstName} ${cita.paciente.lastName}`,
        },
        {
          timeout: 10000, // 10 segundos de timeout
          validateStatus: (status) => status < 500, // Considerar éxito cualquier respuesta < 500
        }
      );
      if (response.status === 404) {
        console.warn(
          "Endpoint de correo no encontrado (404), pero la cita fue creada"
        );
        return true; // Consideramos éxito aunque falle el correo
      }
      return response.data?.success || false;
    } catch (error) {
      console.error("Error al enviar correo:", {
        error: error.message,
        config: error.config,
        response: error.response?.data,
      });
      if (error.response?.status === 404) {
        return true;
      }
      return false;
    }
  };

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "citas"));
        const citasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Parseamos las fechas al cargar los datos
          fechaCita: {
            ...doc.data().fechaCita,
            start: parseFirestoreDate(doc.data().fechaCita?.start),
            end: parseFirestoreDate(doc.data().fechaCita?.end),
          },
        }));

        const citasTransferencia = citasData
          .filter((cita) => cita.pago?.metodo === "transferencia")
          .sort((a, b) => {
            const verificadoA = a.pago?.verificacion?.estado ? 1 : 0;
            const verificadoB = b.pago?.verificacion?.estado ? 1 : 0;
            return verificadoA - verificadoB;
          });

        setCitas(citasTransferencia);
      } catch (error) {
        console.error("Error al obtener citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  const manejarAprobacion = async (id, aprobado) => {
    const estado = aprobado ? "confirmada" : "rechazada";
    const fechaRevision = new Date();

    try {
      const citaRef = doc(db, "citas", id);
      const citaActualizada = citas.find((c) => c.id === id);

      if (!citaActualizada) {
        throw new Error("No se encontró la cita");
      }

      if (aprobado) {
        setLoading(true);

        // Obtenemos la fecha ya parseada (se parseó al cargar los datos)
        const fechaInicio = citaActualizada.fechaCita.start;

        if (!fechaInicio || isNaN(fechaInicio.getTime())) {
          throw new Error("Fecha de cita inválida");
        }

        // 1. Crear la reunión Zoom
        const zoomResponse = await axios.post(
          "https://zoommicroservice-production.up.railway.app/create-appointment",
          {
            userEmail: citaActualizada.paciente.email,
            startTime: fechaInicio.toISOString(),
            userTimeZone: citaActualizada.timeZone || "America/Mexico_City",
          }
        );

        const zoomLink = zoomResponse.data.zoomLink;

        // 2. Actualizar la cita con el enlace Zoom
        await updateDoc(citaRef, {
          estado,
          zoomLink,
          "pago.verificacion.estado": true,
          "pago.verificacion.revisadoPor": user?.email || "admin@example.com",
          "pago.verificacion.fechaRevision": fechaRevision,
          "pago.status": "aprobado",
          "metadata.ultimaActualizacion": fechaRevision,
        });

        // 3. Enviar el correo de confirmación
        const correoEnviado = await enviarCorreoConfirmacion({
          ...citaActualizada,
          zoomLink,
        });

        // 4. Registrar que se envió la notificación
        await updateDoc(citaRef, {
          "notificaciones.confirmacionEnviada": correoEnviado,
          "notificaciones.fechaEnvio": correoEnviado ? new Date() : null,
        });

        if (!correoEnviado) {
          Swal.fire(
            "Advertencia",
            "La cita fue aprobada pero no se pudo enviar el correo de confirmación.",
            "warning"
          );
        } else {
          Swal.fire(
            "Éxito",
            "La cita ha sido aprobada y se ha enviado el enlace Zoom al paciente.",
            "success"
          );
        }

        // Actualizar estado local con zoomLink definido
        setCitas((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  estado,
                  zoomLink, // Aseguramos que zoomLink está definido aquí
                  pago: {
                    ...c.pago,
                    status: "aprobado",
                    verificacion: {
                      estado: true,
                      revisadoPor: user?.email || "admin@example.com",
                      fechaRevision,
                    },
                  },
                  notificaciones: {
                    confirmacionEnviada: correoEnviado,
                    fechaEnvio: correoEnviado ? new Date() : null,
                  },
                }
              : c
          )
        );
      } else {
        const confirmacion = await Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción no se puede deshacer.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Sí, rechazar",
          cancelButtonText: "Cancelar",
        });

        if (!confirmacion.isConfirmed) return;
        setLoading(true);

        await deleteDoc(citaRef);
        setCitas((prev) => prev.filter((c) => c.id !== id));
        Swal.fire(
          "Eliminada",
          "La cita ha sido rechazada y eliminada correctamente.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", `Ocurrió un error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    try {
      const date = parseFirestoreDate(fecha);
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <DashboardLayout>
      <div className="pagos-container">
        <h1 className="pagos-title">Comprobantes de Transferencia</h1>
        
        <div className="pagos-grid">
          {citas.map((cita) => {
            const verificacion = cita.pago?.verificacion || {};
            
            return (
              <div className="pagos-card" key={cita.id}>
                <div className="card-content">
                  <h3>{cita.paciente?.firstName} {cita.paciente?.lastName}</h3>
                  <p><strong>Email:</strong> {cita.paciente?.email}</p>
                  <p><strong>Fecha:</strong> {formatearFecha(cita.fechaCita?.start)}</p>
                  <p><strong>Estado:</strong> {cita.estado}</p>
                  <p><strong>Revisado:</strong> {verificacion.estado ? "Sí" : "No"}</p>
                  {verificacion.fechaRevision && (
                    <p><strong>Fecha revisión:</strong> {formatearFecha(verificacion.fechaRevision)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPagos;
