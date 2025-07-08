import React, { useEffect, useState, useMemo } from "react";
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
import { es } from "date-fns/locale";

// Estilos reutilizables
const styles = {
  mainContainer: { display: 'flex', minHeight: '100vh' },
  sidebar: { 
    width: '250px',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    borderRight: '1px solid rgba(0, 0, 0, 0.12)'
  },
  content: { 
    flexGrow: 1,
    p: 3,
    display: 'flex',
    flexDirection: 'column'
  },
  filterControls: { 
    mb: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2
  }
};

const AdminPagos = () => {
  const [allCitas, setAllCitas] = useState([]);
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

  // Función unificada para manejar Zoom y correo
  const manejarReunionZoomYCorreo = async (cita) => {
    try {
      const fechaInicio = parseFirestoreDate(cita.fechaCita.start);
      if (!fechaInicio || isNaN(fechaInicio.getTime())) {
        throw new Error("Fecha de cita inválida");
      }

      // Crear reunión Zoom
      const zoomResponse = await axios.post(
        "https://zoommicroservice.fly.dev/create-appointment",
        {
          userEmail: cita.paciente.email,
          startTime: fechaInicio.toISOString(),
          userTimeZone: cita.timeZone || "America/Mexico_City",
          sendEmail: true, // Indicar que también debe enviar el correo
          userName: `${cita.paciente.firstName} ${cita.paciente.lastName}`,
        },
        {
          timeout: 10000,
          validateStatus: (status) => status < 500,
        }
      );

      return {
        zoomLink: zoomResponse.data?.zoomLink,
        correoEnviado: zoomResponse.data?.emailSent || false
      };
    } catch (error) {
      console.error("Error en manejarReunionZoomYCorreo:", error);
      if (error.response?.status === 404) {
        return { zoomLink: null, correoEnviado: false };
      }
      throw error;
    }
  };

  // Obtener texto del rango de fechas
  const dateRangeText = useMemo(() => {
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
  }, [filterType, currentDate]);

  // Navegación entre fechas
  const navigateDate = (direction) => {
    const navigators = {
      day: [addDays, subDays],
      week: [addWeeks, subWeeks],
      month: [addMonths, subMonths],
    };

    if (navigators[filterType]) {
      setCurrentDate(navigators[filterType][direction === "next" ? 0 : 1](currentDate, 1));
    }
  };

  // Filtrar citas basado en el rango seleccionado
  const citasFiltradas = useMemo(() => {
    if (filterType === "all") return allCitas;

    const rangeGetters = {
      day: [startOfDay, endOfDay],
      week: [startOfWeek, endOfWeek],
      month: [startOfMonth, endOfMonth],
    };

    if (!rangeGetters[filterType]) return allCitas;

    const [startFn, endFn] = rangeGetters[filterType];
    const startDate = startFn(currentDate, { locale: es });
    const endDate = endFn(currentDate, { locale: es });

    return allCitas.filter((cita) =>
      isWithinInterval(cita.fechaCita.start, { start: startDate, end: endDate })
    );
  }, [filterType, currentDate, allCitas]);

  // Cargar citas iniciales
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const snapshot = await getDocs(collection(db, "citas"));
        const citasData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          fechaCita: {
            ...doc.data().fechaCita,
            start: parseFirestoreDate(doc.data().fechaCita?.start),
            end: parseFirestoreDate(doc.data().fechaCita?.end),
          },
        }));

        const citasTransferencia = citasData
          .filter((cita) => cita.pago?.metodo === "transferencia")
          .sort((a, b) => (a.pago?.verificacion?.estado ? 1 : 0) - (b.pago?.verificacion?.estado ? 1 : 0));

        setAllCitas(citasTransferencia);
      } catch (error) {
        console.error("Error al obtener citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  // Manejar aprobación/rechazo
  const manejarAprobacion = async (id, aprobado) => {
    const estado = aprobado ? "confirmada" : "rechazada";
    const fechaRevision = new Date();

    try {
      const citaRef = doc(db, "citas", id);
      const citaActualizada = allCitas.find((c) => c.id === id);

      if (!citaActualizada) {
        throw new Error("No se encontró la cita");
      }

      if (aprobado) {
        setLoading(true);
        const { zoomLink, correoEnviado } = await manejarReunionZoomYCorreo(citaActualizada);

        await updateDoc(citaRef, {
          estado,
          zoomLink,
          "pago.verificacion.estado": true,
          "pago.verificacion.revisadoPor": user?.email || "admin@example.com",
          "pago.verificacion.fechaRevision": fechaRevision,
          "pago.status": "aprobado",
          "metadata.ultimaActualizacion": fechaRevision,
          "notificaciones.confirmacionEnviada": correoEnviado,
          "notificaciones.fechaEnvio": correoEnviado ? new Date() : null,
        });

        setAllCitas(prev =>
          prev.map(c =>
            c.id === id
              ? {
                  ...c,
                  estado,
                  zoomLink,
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

        Swal.fire(
          correoEnviado ? "Éxito" : "Advertencia",
          correoEnviado
            ? "La cita ha sido aprobada y se ha enviado el enlace Zoom al paciente."
            : "La cita fue aprobada pero no se pudo enviar el correo de confirmación.",
          correoEnviado ? "success" : "warning"
        );
      } else {
        const confirmacion = await Swal.fire({
          title: '¿Estás seguro?',
          text: "Esta acción rechazará y eliminará permanentemente la cita.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });
        
        if (!confirmacion.isConfirmed) return;

        setLoading(true);
        await updateDoc(citaRef, {
          estado,
          "pago.verificacion.estado": false,
          "pago.verificacion.revisadoPor": user?.email || "admin@example.com",
          "pago.verificacion.fechaRevision": fechaRevision,
          "pago.status": "rechazado",
          "metadata.ultimaActualizacion": fechaRevision,
        });

        setAllCitas(prev => prev.filter(c => c.id !== id));
        Swal.fire('Eliminada', 'La cita ha sido rechazada correctamente.', 'success');
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", `Ocurrió un error: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={styles.mainContainer}>
      {/* Sidebar */}
      <Box sx={styles.sidebar}>
        <SideBar />
      </Box>

      {/* Contenido principal */}
      <Box sx={styles.content}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
          Comprobantes de Transferencia
        </Typography>

        {/* Controles de filtrado */}
        <Box sx={styles.filterControls}>
          <ToggleButtonGroup
            value={filterType}
            exclusive
            onChange={(e, newFilterType) => setFilterType(newFilterType)}
            aria-label="Filtro de tiempo"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="day">Día</ToggleButton>
            <ToggleButton value="week">Semana</ToggleButton>
            <ToggleButton value="month">Mes</ToggleButton>
          </ToggleButtonGroup>

          {filterType !== "all" && (
            <Box display="flex" alignItems="center" gap={2} sx={{ flexWrap: 'wrap' }}>
              <Button onClick={() => navigateDate("prev")} variant="outlined">
                Anterior
              </Button>
              <Typography variant="h6" sx={{ textAlign: 'center' }}>
                {dateRangeText}
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
          <Grid container spacing={2}>
            {citasFiltradas.length > 0 ? (
              citasFiltradas.map((cita) => (
                <CitaCard 
                  key={cita.id} 
                  cita={cita} 
                  formatearFecha={formatearFecha}
                  manejarAprobacion={manejarAprobacion}
                  loading={loading}
                />
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" textAlign="center">
                  No hay citas con transferencias pendientes
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

// Componente separado para la tarjeta de cita
const CitaCard = ({ cita, formatearFecha, manejarAprobacion, loading }) => (
  <Grid item xs={12} md={6}>
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">
          {cita.paciente?.firstName} {cita.paciente?.lastName}
        </Typography>
        <Typography>Email: {cita.paciente?.email}</Typography>
        <Typography>Fecha: {formatearFecha(cita.fechaCita?.start)}</Typography>
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
);

export default AdminPagos;