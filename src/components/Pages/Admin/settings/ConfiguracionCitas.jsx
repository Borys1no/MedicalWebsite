import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Chip,
  Checkbox,
} from "@mui/material";
import Swal from "sweetalert2";
import SideBar from "../SideBar/SideBar";

const ConfiguracionCitas = () => {
  const [citas, setCitas] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para convertir fechas de Firebase
  const parseFirebaseDate = (dateData) => {
    try {
      if (!dateData) return null;
      if (dateData.toDate) return dateData.toDate();
      if (dateData.start && dateData.start.toDate) return dateData.start.toDate();
      if (dateData instanceof Date) return dateData;
      if (typeof dateData === 'string') return new Date(dateData);
      return null;
    } catch (e) {
      console.error("Error parsing date:", dateData, e);
      return null;
    }
  };

  // Formatear fecha legible
  const formatDate = (date) => {
    if (!date) return "Fecha no válida";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Cargar citas completadas
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Consulta que busca diferentes variaciones de "completada"
        const q = query(
          collection(db, "citas"),
          where("estado", "in", ["completada", "Completada", "COMPLETADA"])
        );
        
        const querySnapshot = await getDocs(q);
        const citasData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const start = parseFirebaseDate(data.startTime || data.fechaCita);
          const end = parseFirebaseDate(data.endTime || (data.fechaCita?.end || data.fechaCita?.start));

          if (start) {
            citasData.push({
              id: doc.id,
              startTime: start,
              endTime: end || new Date(start.getTime() + 3600000), // 1 hora por defecto
              paciente: {
                nombre: data.paciente
                  ? `${data.paciente.firstName || ""} ${data.paciente.lastName || ""}`.trim()
                  : "No especificado",
                email: data.paciente?.email || "No especificado",
                telefono: data.paciente?.phoneNumber || "No especificado"
              },
              pago: {
                metodo: data.pago?.metodo || "No especificado",
                monto: data.detail?.amount || "No especificado"
              },
              zoomLink: data.zoomLink || "No disponible"
            });
          }
        });

        // Ordenar por fecha más reciente primero
        citasData.sort((a, b) => b.startTime - a.startTime);
        setCitas(citasData);
        
        if (citasData.length === 0) {
          setError("No se encontraron citas completadas");
        }
      } catch (error) {
        console.error("Error al cargar citas:", error);
        setError("Error al cargar citas. Verifica la conexión.");
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

  // Manejar selección individual
  const handleSelect = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Seleccionar todas/deseleccionar
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(citas.map(cita => cita.id));
    } else {
      setSelected([]);
    }
  };

  // Eliminar citas seleccionadas
  const handleEliminarSeleccionadas = async () => {
    if (selected.length === 0) {
      Swal.fire("Info", "No hay citas seleccionadas", "info");
      return;
    }

    const result = await Swal.fire({
      title: `¿Eliminar ${selected.length} citas?`,
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        const batch = selected.map(id => deleteDoc(doc(db, "citas", id)));
        await Promise.all(batch);
        
        setCitas(citas.filter(cita => !selected.includes(cita.id)));
        setSelected([]);
        
        Swal.fire(
          "¡Eliminadas!", 
          `Se eliminaron ${selected.length} citas`, 
          "success"
        );
      } catch (error) {
        Swal.fire("Error", "No se pudieron eliminar las citas", "error");
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando citas completadas...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <SideBar />
      <div style={{ flex: 1, padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Citas Completadas
        </Typography>
        
        {citas.length > 0 ? (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">
                Total: {citas.length} citas completadas
              </Typography>
              
              <Button
                variant="contained"
                color="error"
                onClick={handleEliminarSeleccionadas}
                disabled={selected.length === 0}
              >
                Eliminar seleccionadas ({selected.length})
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.length === citas.length && citas.length > 0}
                        onChange={handleSelectAll}
                        indeterminate={selected.length > 0 && selected.length < citas.length}
                      />
                    </TableCell>
                    <TableCell>Paciente</TableCell>
                    <TableCell>Fecha y Hora</TableCell>
                    <TableCell>Método de Pago</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citas.map((cita) => (
                    <TableRow key={cita.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selected.includes(cita.id)}
                          onChange={() => handleSelect(cita.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography>{cita.paciente.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cita.paciente.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(cita.startTime)}
                      </TableCell>
                      <TableCell>
                        {cita.pago.metodo} - ${cita.pago.monto}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleEliminarSeleccionadas([cita.id])}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <Typography variant="h6">
              No hay citas completadas registradas
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Cuando existan citas con estado "completada", aparecerán aquí.
            </Typography>
          </Paper>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionCitas;