import React, { useEffect, useState } from "react";
import { db } from "../../../../Firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../../../contexts/authContext";
import DashboardLayout from "../DashboardLayout/DashboardLayout";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Link,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import SideBar from "../SideBar/SideBar";
import { 
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
 } from "date-fns";
import { es } from "date-fns/locale"; // Importar el locale español

const AdminPagos = () => {
  const [citas, setCitas] = useState([]);
  const [allcitas, setAllCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [filterType, setFilterType] = useState("all");
  const [currentDate, setCurrentDate] = useState(new Date());

   // Función para parsear fechas
  const parseFirestoreDate = (date) => {
    if (!date) return null;
    if (date.toDate) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  };

  // Función para formatear fechas
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

  // Función para obtener el texto del rango de fechas
  const getDateRangeText = () => {
    switch (filterType) {
      case "day":
        return format(currentDate, "PPPP", { locale: es });
      case "week":
        return `${format(startOfWeek(currentDate, { locale: es }), "d MMM", {
          locale: es,
        })} - ${format(endOfWeek(currentDate, { locale: es }), "d MMM yyyy", {
          locale: es,
        })}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      default:
        return "Todos los pagos";
    }
  };

  // Función para navegar entre fechas
  const navigateDate = (direction) => {
    switch (filterType) {
      case "day":
        setCurrentDate(
          direction === "next"
            ? addDays(currentDate, 1)
            : subDays(currentDate, 1)
        );
        break;
      case "week":
        setCurrentDate(
          direction === "next"
            ? addWeeks(currentDate, 1)
            : subWeeks(currentDate, 1)
        );
        break;
      case "month":
        setCurrentDate(
          direction === "next"
            ? addMonths(currentDate, 1)
            : subMonths(currentDate, 1)
        );
        break;
      default:
        break;
    }
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
        setAllCitas(citasTransferencia);
        setCitas(citasTransferencia);
      } catch (error) {
        console.error("Error al obtener citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  useEffect(() =>{
    if (filterType === "all"){
      setCitas(allcitas);
      return;
    }
    let startDate, endDate;
    switch (filterType){
      case "day":
      startDate = startOfDay(currentDate);
      endDate = endOfDay(currentDate);
      break;
    case "week":
      startDate = startOfWeek(currentDate, { locale: es });
      endDate = endOfWeek(currentDate, { locale: es });
      break;
    case "month":
      startDate = startOfMonth(currentDate);
      endDate = endOfMonth(currentDate);
      break;
    default:
      return;
    }
    const filtered = allcitas.filter((cita) =>
    isWithinInterval(cita.fechaCita.start, {
      start: startDate,
      end: endDate })
    );
    setCitas(filtered);
  }, [filterType, currentDate, allcitas]);

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
          title: '¿Estás seguro?',
          text: "Esta acción rechazará y eliminará permanentemente la cita. No podrás revertir esto.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });
        if (!confirmacion.isConfirmed) return;

      setLoading(true);
        // Solo actualizar estado si es rechazado
        await updateDoc(citaRef);

        // Actualizar estado local para rechazo
        setCitas(prev => prev.filter(c => c.id !== id));

        Swal.fire(
          'Eliminada',
          'La cita ha sido rechazada y eliminada correctamente.',
          'success'
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", `Ocurrió un error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    {/* Sidebar fijo */}
    <Box sx={{ 
      width: '250px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      borderRight: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <SideBar />
    </Box>

    {/* Contenido principal */}
    <Box sx={{ 
      flexGrow: 1,
      p: 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Título */}
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
        Comprobantes de Transferencia
      </Typography>

      {/* Controles de filtrado */}
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(e, newFilterType) => setFilterType(newFilterType)}
          aria-label="Filtro de tiempo"
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all" aria-label="Todos">Todos</ToggleButton>
          <ToggleButton value="day" aria-label="Día">Día</ToggleButton>
          <ToggleButton value="week" aria-label="Semana">Semana</ToggleButton>
          <ToggleButton value="month" aria-label="Mes">Mes</ToggleButton>
        </ToggleButtonGroup>

        {filterType !== "all" && (
          <Box display="flex" alignItems="center" gap={2} sx={{ flexWrap: 'wrap' }}>
            <Button onClick={() => navigateDate("prev")} variant="outlined">
              Anterior
            </Button>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {getDateRangeText()}
            </Typography>
            <Button onClick={() => navigateDate("next")} variant="outlined">
              Siguiente
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="contained"
              color="primary"
            >
              Hoy
            </Button>
          </Box>
        )}
      </Box>

      {/* Lista de citas */}
      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {citas.length > 0 ? (
              citas.map((cita) => (
                <Grid item xs={12} md={6} key={cita.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">
                        {cita.paciente?.firstName} {cita.paciente?.lastName}
                      </Typography>
                      <Typography>Email: {cita.paciente?.email}</Typography>
                      <Typography>
                        Fecha: {formatearFecha(cita.fechaCita?.start)}
                      </Typography>
                      <Typography>Estado actual: {cita.estado}</Typography>
                      <Typography>
                        Revisado: {cita.pago?.verificacion?.estado ? "Sí" : "No"}
                      </Typography>
                      {cita.pago?.verificacion?.fechaRevision && (
                        <Typography>
                          Fecha de revisión: {formatearFecha(cita.pago.verificacion.fechaRevision)}
                        </Typography>
                      )}
                      {cita.pago?.comprobante?.url ? (
                        <Typography>
                          <Link
                            href={cita.pago.comprobante.url}
                            download={`comprobante-${cita.id}.jpg`}
                            rel="noopener"
                            target="_blank"
                          >
                            Descargar Comprobante
                          </Link>
                        </Typography>
                      ) : (
                        <Typography color="error">
                          No se ha subido un comprobante
                        </Typography>
                      )}

                      {!cita.pago?.verificacion?.estado && (
                        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => manejarAprobacion(cita.id, true)}
                            disabled={loading}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => manejarAprobacion(cita.id, false)}
                            disabled={loading}
                          >
                            Rechazar
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" textAlign="center">
                  No hay citas con transferencias pendientes
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  </Box>
);
};

export default AdminPagos;