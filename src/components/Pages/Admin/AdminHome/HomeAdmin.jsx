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

  const fetchAppointments = async (startDate, endDate) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'citas'),
        where('startTime', '>=', startDate),
        where('startTime', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().userId ? 'Cita Agendada' : 'No Disponible',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        userId: doc.data().userId,
        color: doc.data().userId ? '#5cb85c' : '#d9534f', // Verde si está agendado, rojo si es no disponible
      }));
      setEvents(appointments);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    }
    setLoading(false);
  };

  const handleDatesSet = (arg) => {
    const startDate = arg.start;
    const endDate = arg.end;
    fetchAppointments(startDate, endDate);
  };

  const handleEventClick = async (clickInfo) => {
    if (clickInfo.event.extendedProps.userId) {
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
      }
      setIsModalOpen(true);
    }
  };

  const handleDateClick = (info) => {
    setSelectedSlot(info);
    setIsUnavailableModalOpen(true);
  };

  const markAsUnavailable = async () => {
    if (selectedSlot) {
      const { start, allDay } = selectedSlot;
      const newUnavailableEvent = {
        title: 'No Disponible',
        start: start,
        end: allDay ? new Date(start).setHours(23, 59, 59) : new Date(start).setHours(start.getHours() + 1),
        color: '#d9534f', // Rojo para indicar no disponible
        allDay: allDay,
      };

      try {
        await setDoc(doc(collection(db, 'citas')), {
          startTime: new Date(newUnavailableEvent.start),
          endTime: new Date(newUnavailableEvent.end),
          userId: null,
        });
        setEvents((prevEvents) => [...prevEvents, newUnavailableEvent]);
      } catch (error) {
        console.error('Error al marcar como no disponible:', error);
      }
    }
    setIsUnavailableModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setPatientInfo(null);
  };

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
