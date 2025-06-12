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
  DialogContentText,
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
import SideBar from "../SideBar/SideBar";
import { jsPDF } from "jspdf";

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [allCitas, setAllCitas] = useState([]); // Todas las citas sin filtrar
  const [citaSelected, setCitaSelected] = useState(null);
  const [estado, setEstado] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detalleOpen, setDetalleOpen] = useState(false);

  const [filterType, setFilterType] = useState("all"); // 'day', 'week', 'month', 'all'
  const [currentDate, setCurrentDate] = useState(new Date());

  const convertirFecha = (timestamp) => {
    if (!timestamp) return null;
    return typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);
  };

  const [recetaOpen, setRecetaOpen] = useState(false);
  const [recetaData, setRecetaData] = useState({
    medicamentos: "",
    indicaciones: "",
    observaciones: "",
  });

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
                monto: data.detail?.amount || "No especificado",
                tarjeta: data.detail?.cardInfo || "No especificado",
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

  // Efecto para aplicar filtros cuando cambia el tipo o la fecha
  useEffect(() => {
    if (filterType === "all") {
      setCitas(allCitas);
      return;
    }

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
        return;
    }

    const filtered = allCitas.filter(
      (cita) =>
        isWithinInterval(cita.startTime, { start: startDate, end: endDate }) ||
        isWithinInterval(cita.endTime, { start: startDate, end: endDate })
    );

    setCitas(filtered);
  }, [filterType, currentDate, allCitas]);

  const handleFilterChange = (event, newFilterType) => {
    if (newFilterType !== null) {
      setFilterType(newFilterType);
    }
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

  //Funcion para abrir el modal de receta
  const handleOpenReceta = (cita) => {
    setCitaSelected(cita);
    setRecetaOpen(true);
  };

  //Funcion para cerrar el modal de receta
  const handleCloseReceta = () => {
    setRecetaOpen(false);
    setRecetaData({
      medicamentos: "",
      indicaciones: "",
      observaciones: "",
    });
  };

  //Funcion para manejar cambios en el formulario de receta

  const handleRecetaChange = (e) => {
    const { name, value } = e.target;
    setRecetaData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Funcion para generar y enviar la receta
  const generarYEnviarReceta = async () => {
  // Colores corporativos
  const colorReuma = "#aece57";
  const colorSur = "#2a43d2";
  const colorGris = "#666666";

  if (!citaSelected || !recetaData.medicamentos) return;

  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

  

    // Margenes
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- CABECERA ---
    // Logo (texto estilizado como logo)
    doc.setFontSize(22);
    doc.setTextColor(colorReuma);
    doc.text("Reuma", marginLeft, 20);
    doc.setTextColor(colorSur);
    doc.text("sur", marginLeft + 28, 20);

    // Información de la clínica
    doc.setFontSize(10);
    doc.setTextColor(colorGris);
    doc.text("Clínica de Reumatología", marginLeft, 28);
    doc.text("Dr. Emilio Aroca Briones", marginLeft, 33);
    doc.text("Especialista en Reumatología", marginLeft, 38);

    // Fecha y ciudad
    const fechaActual = new Date();
    doc.setFontSize(10);
    doc.setTextColor(0); // Negro
    doc.text(`Fecha: ${format(fechaActual, "dd/MM/yyyy")}`, pageWidth - marginRight - 40, 20, { align: "right" });
    doc.text(`Machala - El Oro, Ecuador`, pageWidth - marginRight - 40, 25, { align: "right" });

    // Línea divisoria
    doc.setDrawColor(colorSur);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, 42, pageWidth - marginRight, 42);

    // --- DATOS DEL PACIENTE ---
    doc.setFontSize(14);
    doc.setTextColor(colorSur);
    doc.text("DATOS DEL PACIENTE", marginLeft, 50);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Nombre: ${citaSelected.paciente.nombre}`, marginLeft, 58);
    doc.text(`Fecha de atención: ${format(citaSelected.fechaCita, "dd/MM/yyyy")}`, marginLeft, 64);

    // Línea divisoria
    doc.setDrawColor(colorReuma);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, 68, pageWidth - marginRight, 68);

    // --- RECETA / PRESCRIPCIÓN ---
    doc.setFontSize(16);
    doc.setTextColor(colorSur);
    doc.text("PRESCRIPCIÓN MÉDICA", pageWidth / 2, 78, { align: "center" });

    // Variables para control de posición
    let currentY = 86;

    // Medicamentos
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Medicamentos:", marginLeft, currentY);
    currentY += 6;
    
    doc.setFontSize(11);
    const medicamentosLines = doc.splitTextToSize(recetaData.medicamentos, contentWidth);
    doc.text(medicamentosLines, marginLeft, currentY);
    currentY += medicamentosLines.length * 6 + 10; // Aprox. 6mm por línea + espacio

    // Indicaciones
    doc.setFontSize(12);
    doc.text("Indicaciones:", marginLeft, currentY);
    currentY += 6;
    
    doc.setFontSize(11);
    const indicacionesLines = doc.splitTextToSize(recetaData.indicaciones, contentWidth);
    doc.text(indicacionesLines, marginLeft, currentY);
    currentY += indicacionesLines.length * 6 + 10;

    // Observaciones
    if (recetaData.observaciones) {
      doc.setFontSize(12);
      doc.text("Observaciones:", marginLeft, currentY);
      currentY += 6;
      
      doc.setFontSize(11);
      const observacionesLines = doc.splitTextToSize(recetaData.observaciones, contentWidth);
      doc.text(observacionesLines, marginLeft, currentY);
      currentY += observacionesLines.length * 6 + 10;
    }

    // --- FOOTER ---
    const footerY = 260; // Posición fija para el footer
    
    // Línea divisoria del footer
    doc.setDrawColor(colorGris);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, footerY - 5, pageWidth - marginRight, footerY - 5);

    // Firma del médico
    doc.setFontSize(10);
    doc.text("Firma y sello del médico:", marginLeft, footerY);
    doc.text("_________________________", marginLeft, footerY + 6);
    doc.text("Dr. Emilio Aroca Briones", marginLeft, footerY + 12);
    
    // Información de contacto
    doc.setFontSize(9);
    doc.setTextColor(colorGris);
    doc.text("Centro de Diagnóstico CEDIAG", pageWidth - marginRight, footerY, { align: "right" });
    doc.text("Bocayá el Colón y Tarqui", pageWidth - marginRight, footerY + 5, { align: "right" });
    doc.text("Machala - El Oro, Ecuador", pageWidth - marginRight, footerY + 10, { align: "right" });
    doc.text("Teléfono: 0980304357", pageWidth - marginRight, footerY + 15, { align: "right" });
    doc.text("Email: emilio_aroca@yahoo.com", pageWidth - marginRight, footerY + 20, { align: "right" });
    
    const pdfBlob = doc.output('blob');
    
    // 2. Convertir a base64 de manera más confiable
    const pdfBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Eliminar el prefijo "data:application/pdf;base64,"
        const base64Data = reader.result.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(pdfBlob);
    });
     // Verificar que todos los campos requeridos estén presentes
    if (!citaSelected.paciente.email || !citaSelected.paciente.nombre || !pdfBase64) {
      throw new Error('Faltan datos requeridos para enviar la receta');
    }

    // 4. Preparar payload con nombres exactos que espera el backend
    const payload = {
      email: citaSelected.paciente.email.trim(),
      nombrePaciente: citaSelected.paciente.nombre.trim(),
      recetaPDFBase64: pdfBase64
    };
    console.log('Payload completo:', {
      ...payload,
      recetaPDFBase64: `${payload.recetaPDFBase64.substring(0, 50)}...` // Muestra solo inicio del base64
    });

    
    // Enviar al Backend
    const response = await fetch("https://zoommicroservice.fly.dev/enviar-receta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
      },
     body: JSON.stringify(payload)
    });



    // 6. Manejo mejorado de la respuesta
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Error al enviar receta');
    }

    alert("Receta enviada exitosamente");
    handleCloseReceta();
    
  } catch (error) {
    console.error("Error completo:", {
      message: error.message,
      stack: error.stack
    });
    alert(`Error al enviar receta: ${error.message}`);
  }
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
      //Si el estado es "completada", mostrar el boton de receta
      if (estado === "completada") {
        setModalOpen(false);
        handleOpenReceta(citaSelected);
      } else {
        handleCloseModal();
      }
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
          Gestión de Citas
        </Typography>
        {/* Controles de filtrado */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
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

          {filterType !== "all" && (
            <Box display="flex" alignItems="center">
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
            </Box>
          )}
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
                <TableCell>Zoom</TableCell>
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
                      {cita.zoomLink !== "No disponible" ? (
                        <Link
                          href={cita.zoomLink}
                          target="_blank"
                          rel="noopener"
                        >
                          Unirse
                        </Link>
                      ) : (
                        "No disponible"
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleOpenModal(cita)}
                        >
                          Cambiar Estado
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDetalle(cita)}
                        >
                          Detalles
                        </Button>
                        <Button 
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenReceta(cita) }

                        >
                          Receta
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

        {/* Modal para cambiar estado */}
        <Dialog open={modalOpen} onClose={handleCloseModal}>
          <DialogTitle>Cambiar estado de la cita</DialogTitle>
          <DialogContent>
            {citaSelected && (
              <>
                <Typography gutterBottom>
                  Paciente: <strong>{citaSelected.paciente.nombre}</strong>
                </Typography>
                <Typography gutterBottom>
                  Fecha:{" "}
                  <strong>
                    {format(citaSelected.fechaCita, "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </strong>
                </Typography>
                <Typography gutterBottom>
                  Hora:{" "}
                  <strong>
                    {format(citaSelected.startTime, "HH:mm")} -{" "}
                    {format(citaSelected.endTime, "HH:mm")}
                  </strong>
                </Typography>

                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Seleccionar nuevo estado:
                  </Typography>
                  <Select
                    fullWidth
                    value={estado}
                    onChange={handleEstadoChange}
                  >
                    <MenuItem value="confirmada">Confirmada</MenuItem>
                    <MenuItem value="completada">Completada</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                    <MenuItem value="pendiente_verificacion">
                      Pendiente verificación
                    </MenuItem>
                    <MenuItem value="rechazada">Rechazada</MenuItem>
                  </Select>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button
              onClick={actualizarEstadoCita}
              color="primary"
              variant="contained"
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
        {/* Modal para receta médica */}
        <Dialog
          open={recetaOpen}
          onClose={handleCloseReceta}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Generar Receta Médica</DialogTitle>
          <DialogContent>
            {citaSelected && (
              <>
                <DialogContentText gutterBottom>
                  Paciente: <strong>{citaSelected.paciente.nombre}</strong>
                </DialogContentText>

                <TextField
                  autoFocus
                  margin="dense"
                  name="medicamentos"
                  label="Medicamentos (nombre, dosis, frecuencia)"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={recetaData.medicamentos}
                  onChange={handleRecetaChange}
                  required
                />

                <TextField
                  margin="dense"
                  name="indicaciones"
                  label="Indicaciones médicas"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={recetaData.indicaciones}
                  onChange={handleRecetaChange}
                />

                <TextField
                  margin="dense"
                  name="observaciones"
                  label="Observaciones"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                  value={recetaData.observaciones}
                  onChange={handleRecetaChange}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReceta}>Cancelar</Button>
            <Button
              onClick={generarYEnviarReceta}
              color="primary"
              variant="contained"
              disabled={!recetaData.medicamentos}
            >
              Generar y Enviar Receta
            </Button>
          </DialogActions>
        </Dialog>

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
                    <strong>Monto:</strong> ${citaSelected.pago.monto}
                  </Typography>
                  <Typography>
                    <strong>Tarjeta:</strong> {citaSelected.pago.tarjeta}
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

export default Citas;
