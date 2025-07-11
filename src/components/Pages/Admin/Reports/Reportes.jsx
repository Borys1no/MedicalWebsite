import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  CircularProgress,
  Link,
  Chip,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from "@mui/material";
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
import ReporteCitasPDF from "./ReporteCitasPDF";
import SideBar from "../SideBar/SideBar";
import { PDFDownloadLink } from "@react-pdf/renderer";

const Reportes = () => {
  const [citas, setCitas] = useState([]);
  const [allCitas, setAllCitas] = useState([]); // Todas las citas sin filtrar
  const [citaSelected, setCitaSelected] = useState(null);
  const [estado, setEstado] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  const [filterType, setFilterType] = useState("all"); // 'day', 'week', 'month', 'all'
  const [currentDate, setCurrentDate] = useState(new Date());

  const convertirFecha = (timestamp) => {
    if (!timestamp) return null;
    return typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);
  };

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "citas"));
        const citasData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === "NoDisponible"){
            return; 
          }
          const start = convertirFecha(data.startTime || data.fechaCita?.start);
          const end = convertirFecha(data.endTime || data.fechaCita?.end);

          if (start && end) {
            citasData.push({
              id: doc.id,
              startTime: start,
              endTime: end,
              fechaCita: start,
              paciente: {
                nombre: data.paciente
                  ? `${data.paciente.firstName || ""} ${
                      data.paciente.lastName || ""
                    }`.trim()
                  : "No especificado",
                email: data.paciente?.email || "No especificado",
                telefono: data.paciente?.phoneNumber || "No especificado",
              },
              estado: data.estado || "pendiente",
              pago: {
                metodo: data.pago?.metodo || "No especificado",
                estado:
                  data.respuesta?.description ||
                  data.pago?.estado ||
                  "No especificado",
                monto:
                  data.pago?.monto || data.detail?.amount || "No especificado",
              },
              zoomLink: data.zoomLink || "No disponible",
              timeZone: data.timeZone || "No especificado",
            });
          }
        });

        citasData.sort((a, b) => a.startTime - b.startTime);
        setAllCitas(citasData);
        setCitas(citasData);
      } catch (error) {
        console.error("Error al cargar citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  // Efecto para aplicar filtros cuando cambia el tipo, la fecha o el término de búsqueda
  useEffect(() => {
    let filtered = [...allCitas];
    
    // Aplicar filtro por nombre si hay un término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cita => 
        cita.paciente.nombre.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro por fecha si no es "all"
    if (filterType !== "all") {
      let startDate, endDate;

      switch (filterType) {
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
          break;
      }

      filtered = filtered.filter(
        (cita) =>
          isWithinInterval(cita.startTime, { start: startDate, end: endDate }) ||
          isWithinInterval(cita.endTime, { start: startDate, end: endDate })
      );
    }

    setCitas(filtered);
  }, [filterType, currentDate, allCitas, searchTerm]);

  const handleFilterChange = (event, newFilterType) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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
        return "Todas las citas";
    }
  };

  const handleOpenModal = (cita) => {
    setCitaSelected(cita);
    setEstado(cita.estado);
    setModalOpen(true);
  };

  const handleOpenDetalle = (cita) => {
    setCitaSelected(cita);
    setDetalleOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDetalleOpen(false);
    setCitaSelected(null);
  };

  const handleEstadoChange = (event) => {
    setEstado(event.target.value);
  };

  const actualizarEstadoCita = async () => {
    if (!citaSelected || !estado) return;

    try {
      const citaRef = doc(db, "citas", citaSelected.id);
      await updateDoc(citaRef, { estado });

      setCitas(
        citas.map((cita) =>
          cita.id === citaSelected.id ? { ...cita, estado } : cita
        )
      );

      handleCloseModal();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "completada":
        return "success";
      case "cancelada":
      case "rechazada":
        return "error";
      case "confirmada":
        return "primary";
      case "pendiente":
      case "pendiente_verificacion":
        return "warning";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Reportes
        </Typography>
        
        {/* Controles de filtrado */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={handleFilterChange}
              aria-label="Filtro de tiempo"
            >
              <ToggleButton value="all" aria-label="Todas">
                Todas
              </ToggleButton>
              <ToggleButton value="day" aria-label="Día">
                Día
              </ToggleButton>
              <ToggleButton value="week" aria-label="Semana">
                Semana
              </ToggleButton>
              <ToggleButton value="month" aria-label="Mes">
                Mes
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Campo de búsqueda por nombre */}
            <TextField
              label="Buscar por nombre"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: 250 }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {filterType !== "all" && (
              <>
                <Button onClick={() => navigateDate("prev")} variant="outlined">
                  Anterior
                </Button>
                <Typography variant="h6" mx={2}>
                  {getDateRangeText()}
                </Typography>
                <Button onClick={() => navigateDate("next")} variant="outlined">
                  Siguiente
                </Button>
                <Button
                  onClick={() => setCurrentDate(new Date())}
                  variant="contained"
                  color="primary"
                  sx={{ ml: 2 }}
                >
                  Hoy
                </Button>

                {/* Botón para descargar PDF */}
                <PDFDownloadLink
                  document={
                    <ReporteCitasPDF
                      citas={citas}
                      filtro={
                        filterType === "day"
                          ? "Diario"
                          : filterType === "week"
                          ? "Semanal"
                          : "Mensual"
                      }
                      rango={getDateRangeText()}
                    />
                  }
                  fileName={`reporte-citas-${filterType}-${format(
                    new Date(),
                    "yyyy-MM-dd"
                  )}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={loading || citas.length === 0}
                      startIcon={
                        loading ? <CircularProgress size={20} /> : null
                      }
                    >
                      {loading ? "Generando PDF..." : "Descargar Reporte"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </>
            )}
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Paciente</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Método de Pago</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {citas.length > 0 ? (
                citas.map((cita) => (
                  <TableRow key={cita.id}>
                    <TableCell>
                      <Typography>
                        {cita.paciente.nombre || "No especificado"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cita.paciente.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(cita.fechaCita, "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {format(cita.startTime, "HH:mm")} -{" "}
                      {format(cita.endTime, "HH:mm")}
                    </TableCell>
                    <TableCell>{cita.pago.metodo}</TableCell>
                    <TableCell>
                      <Chip
                        label={cita.estado}
                        color={getEstadoColor(cita.estado)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDetalle(cita)}
                        >
                          Detalles
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay citas programadas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal para detalles de la cita */}
        <Dialog
          open={detalleOpen}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Detalles completos de la cita</DialogTitle>
          <DialogContent>
            {citaSelected && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información del Paciente
                </Typography>
                <Box mb={3}>
                  <Typography>
                    <strong>Nombre:</strong> {citaSelected.paciente.nombre}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {citaSelected.paciente.email}
                  </Typography>
                  <Typography>
                    <strong>Teléfono:</strong> {citaSelected.paciente.telefono}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Detalles de la Cita
                </Typography>
                <Box mb={3}>
                  <Typography>
                    <strong>Fecha:</strong>{" "}
                    {format(citaSelected.fechaCita, "PPPP", { locale: es })}
                  </Typography>
                  <Typography>
                    <strong>Hora:</strong>{" "}
                    {format(citaSelected.startTime, "HH:mm")} -{" "}
                    {format(citaSelected.endTime, "HH:mm")}
                  </Typography>
                  <Typography>
                    <strong>Zona horaria:</strong> {citaSelected.timeZone}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography component="span">
                      <strong>Estado:</strong>
                    </Typography>
                    <Box ml={1}>
                      <Chip
                        label={citaSelected.estado}
                        color={getEstadoColor(citaSelected.estado)}
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Información de Pago
                </Typography>
                <Box mb={3}>
                  <Typography>
                    <strong>Método:</strong> {citaSelected.pago.metodo}
                  </Typography>
                  <Typography>
                    <strong>Estado:</strong> {citaSelected.pago.estado}
                  </Typography>
                  <Typography>
                    <strong>Monto:</strong> $
                    {typeof citaSelected.pago.monto === "number"
                      ? citaSelected.pago.monto.toFixed(2)
                      : citaSelected.pago.monto}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Enlace de Zoom
                </Typography>
                <Typography>
                  {citaSelected.zoomLink !== "No disponible" ? (
                    <Link
                      href={citaSelected.zoomLink}
                      target="_blank"
                      rel="noopener"
                    >
                      {citaSelected.zoomLink}
                    </Link>
                  ) : (
                    "No disponible"
                  )}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Reportes;