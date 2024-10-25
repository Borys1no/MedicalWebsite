import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../../Firebase/firebase';
import SideBar from '../SideBar/SideBar';
import Modal from 'react-modal';
import './HomeAdmin.css';

// Configura el elemento del modal
Modal.setAppElement('#root');

const AdminHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Cargar las citas del calendario
  const fetchAppointments = async (startDate, endDate) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'citas'),
        where('startTime', '>=', startDate),
        where('startTime', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.type === 'NoDisponible' ? 'No Disponible' : 'Cita Agendada',
          start: data.startTime.toDate(),
          end: data.endTime.toDate(),
          userId: data.userId,
          color: data.type === 'NoDisponible' ? '#d9534f' : '#5cb85c', // Rojo para no disponible, verde para citas
        };
      });
      setEvents(appointments);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
    setLoading(false);
  };

  // Actualizar el calendario cuando cambian las fechas visibles
  const handleDatesSet = (arg) => {
    const startDate = arg.start;
    const endDate = arg.end;
    fetchAppointments(startDate, endDate);
  };

  // Mostrar modal al hacer clic en un evento
  const handleEventClick = async (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    const userId = clickInfo.event.extendedProps.userId;

    if (userId) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setPatientInfo(userDoc.data());
        } else {
          console.error('No se encontró información del usuario');
          setPatientInfo(null);
        }
      } catch (error) {
        console.error('Error al cargar información del usuario:', error);
        setPatientInfo(null);
      }
    } else {
      // Si no hay `userId`, no buscamos información del paciente
      setPatientInfo(null);
    }
    setIsModalOpen(true);
  };

  // Mostrar modal para marcar como no disponible al hacer clic en un slot vacío
  const handleDateClick = (info) => {
    if (info && info.date) {
      setSelectedSlot(info);
      setIsUnavailableModalOpen(true);
    } else {
      console.error('No se pudo seleccionar el horario.');
    }
  };

  // Marcar un horario como "No Disponible"
  const markAsUnavailable = async () => {
    if (selectedSlot && selectedSlot.date) {
      const start = new Date(selectedSlot.date); // Fecha de inicio del slot seleccionado
      let end = new Date(start);

      // Determinar la duración del evento "No Disponible"
      end.setHours(start.getHours() + 1);

      const newUnavailableEvent = {
        title: 'No Disponible',
        start: start,
        end: end,
        type: 'NoDisponible', // Añadimos el tipo de evento
        color: '#d9534f', // Rojo para indicar no disponible
      };

      try {
        await setDoc(doc(collection(db, 'citas')), {
          startTime: newUnavailableEvent.start,
          endTime: newUnavailableEvent.end,
          type: 'NoDisponible', // Guardamos el tipo de evento en la base de datos
          userId: null, // Sin `userId` ya que es un horario no disponible
        });
        setEvents((prevEvents) => [...prevEvents, newUnavailableEvent]);
        console.log('Horario marcado como no disponible correctamente.');
      } catch (error) {
        console.error('Error al marcar como no disponible:', error);
      }
    } else {
      console.error('No hay un horario seleccionado para marcar como no disponible o el horario no es válido.');
    }
    setIsUnavailableModalOpen(false);
  };

  // Cerrar modal de detalles de la cita
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setPatientInfo(null);
  };

  // Cerrar modal de marcar como no disponible
  const closeUnavailableModal = () => {
    setIsUnavailableModalOpen(false);
    setSelectedSlot(null);
  };

  return (
    <div className="admin-container">
      <SideBar />
      <div className="content">
        <h1 className="txt-title">Bienvenido administrador</h1>
        {loading && <p>Cargando citas...</p>}
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          slotDuration="01:00:00"
          slotMinTime="08:00:00"
          slotMaxTime="17:00:00"
          weekends={false}
          height="auto"
          allDaySlot={false}
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          dateClick={handleDateClick} // Manejador para clic en fecha no reservada
        />

        {/* Modal para mostrar detalles de la cita */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Detalles de la Cita"
          className="Modal"
          overlayClassName="Overlay"
        >
          {selectedEvent && (
            <>
              <h2>Detalles de la Cita</h2>
              <p><strong>Fecha y Hora:</strong> {new Date(selectedEvent.start).toLocaleString()}</p>
              {patientInfo ? (
                <>
                  <p><strong>Nombre:</strong> {patientInfo.firstName} {patientInfo.lastName}</p>
                  <p><strong>Teléfono:</strong> {patientInfo.phoneNumber}</p>
                  <p><strong>Número de Identificación:</strong> {patientInfo.identificationNumber}</p>
                  <p><strong>Email:</strong> {patientInfo.email}</p>
                  <p><strong>País:</strong> {patientInfo.country}</p>
                  <p><strong>Ciudad:</strong> {patientInfo.city}</p>
                </>
              ) : (
                <p>Cargando información del paciente...</p>
              )}
              <button onClick={closeModal} className="close-modal-btn">Cerrar</button>
            </>
          )}
        </Modal>

        {/* Modal para marcar como no disponible */}
        <Modal
          isOpen={isUnavailableModalOpen}
          onRequestClose={closeUnavailableModal}
          contentLabel="Marcar como No Disponible"
          className="Modal"
          overlayClassName="Overlay"
        >
          {selectedSlot && (
            <>
              <h2>Marcar como No Disponible</h2>
              <p>¿Deseas marcar este horario como no disponible?</p>
              <button onClick={markAsUnavailable} className="confirm-modal-btn">Confirmar</button>
              <button onClick={closeUnavailableModal} className="close-modal-btn">Cancelar</button>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminHome;
