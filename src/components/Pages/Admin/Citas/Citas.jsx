import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../Firebase/firebase';
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
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SideBar from '../SideBar/SideBar';

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [citaSelected, setCitaSelected] = useState(null);
  const [estado, setEstado] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detalleOpen, setDetalleOpen] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'citas'));
        const citasData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const paciente = data.paciente || {};
          const pago = data.pago || {};
          const respuesta = data.respuesta || {};
          const detail = data.detail || {};

          return {
            id: doc.id,
            fechaCita: data.fechaCita?.toDate() || new Date(0),
            startTime: data.startTime?.toDate() || new Date(0),
            endTime: data.endTime?.toDate() || new Date(0),
            paciente: {
              nombre: `${paciente.firstName || ''} ${paciente.lastName || ''}`.trim(),
              email: paciente.email || 'No especificado',
              telefono: paciente.phoneNumber || 'No especificado'
            },
            estado: data.estado || 'confirmada',
            pago: {
              metodo: pago.metodo || 'No especificado',
              estado: respuesta.description || 'No especificado',
              monto: detail.amount || 'No especificado',
              tarjeta: detail.cardInfo || 'No especificado'
            },
            zoomLink: data.zoomLink || 'No disponible',
            timeZone: data.timeZone || 'No especificado'
          };
        });

        citasData.sort((a, b) => a.startTime - b.startTime);
        setCitas(citasData);
      } catch (error) {
        console.error('Error al cargar citas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, []);

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
      const citaRef = doc(db, 'citas', citaSelected.id);
      await updateDoc(citaRef, { estado });
      
      setCitas(citas.map(cita => 
        cita.id === citaSelected.id ? { ...cita, estado } : cita
      ));
      
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'cancelada':
        return 'error';
      case 'confirmada':
        return 'warning';
      default:
        return 'primary';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestión de Citas
        <SideBar />

      </Typography>
      
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
                    <Typography>{cita.paciente.nombre || 'No especificado'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cita.paciente.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {format(cita.fechaCita, 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(cita.startTime, 'HH:mm')} - {format(cita.endTime, 'HH:mm')}
                  </TableCell>
                  <TableCell>{cita.pago.metodo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={cita.estado} 
                      color={getEstadoColor(cita.estado)} 
                    />
                  </TableCell>
                  <TableCell>
                    {cita.zoomLink !== 'No disponible' ? (
                      <Link href={cita.zoomLink} target="_blank" rel="noopener">
                        Unirse
                      </Link>
                    ) : (
                      'No disponible'
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
                Fecha: <strong>{format(citaSelected.fechaCita, 'dd/MM/yyyy', { locale: es })}</strong>
              </Typography>
              <Typography gutterBottom>
                Hora: <strong>{format(citaSelected.startTime, 'HH:mm')} - {format(citaSelected.endTime, 'HH:mm')}</strong>
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
                  <MenuItem value="no_asistio">No asistió</MenuItem>
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

      {/* Modal para detalles de la cita */}
      {/* Modal para detalles de la cita */}
<Dialog open={detalleOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
  <DialogTitle>Detalles completos de la cita</DialogTitle>
  <DialogContent>
    {citaSelected && (
      <Box>
        <Typography variant="h6" gutterBottom>Información del Paciente</Typography>
        <Box mb={3}>
          <Typography><strong>Nombre:</strong> {citaSelected.paciente.nombre}</Typography>
          <Typography><strong>Email:</strong> {citaSelected.paciente.email}</Typography>
          <Typography><strong>Teléfono:</strong> {citaSelected.paciente.telefono}</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>Detalles de la Cita</Typography>
        <Box mb={3}>
          <Typography><strong>Fecha:</strong> {format(citaSelected.fechaCita, 'PPPP', { locale: es })}</Typography>
          <Typography><strong>Hora:</strong> {format(citaSelected.startTime, 'HH:mm')} - {format(citaSelected.endTime, 'HH:mm')}</Typography>
          <Typography><strong>Zona horaria:</strong> {citaSelected.timeZone}</Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <Typography component="span"><strong>Estado:</strong></Typography>
            <Box ml={1}>
              <Chip 
                label={citaSelected.estado} 
                color={getEstadoColor(citaSelected.estado)} 
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>Información de Pago</Typography>
        <Box mb={3}>
          <Typography><strong>Método:</strong> {citaSelected.pago.metodo}</Typography>
          <Typography><strong>Estado:</strong> {citaSelected.pago.estado}</Typography>
          <Typography><strong>Monto:</strong> ${citaSelected.pago.monto}</Typography>
          <Typography><strong>Tarjeta:</strong> {citaSelected.pago.tarjeta}</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>Enlace de Zoom</Typography>
        <Typography>
          {citaSelected.zoomLink !== 'No disponible' ? (
            <Link href={citaSelected.zoomLink} target="_blank" rel="noopener">
              {citaSelected.zoomLink}
            </Link>
          ) : (
            'No disponible'
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
  );
};

export default Citas;