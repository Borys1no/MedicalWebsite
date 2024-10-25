import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../Firebase/firebase';
import SideBar from '../SideBar/SideBar';
import Modal from 'react-modal'; // Importa Modal
import './HomeAdmin.css';

// Configura el elemento del modal
Modal.setAppElement('#root');

const AdminHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);

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
        title: 'Cita Agendada',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        userId: doc.data().userId, // Se añade userId para buscar al paciente
        color: '#5cb85c', // Verde para indicar que está agendado
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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setPatientInfo(null);
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
          eventClick={handleEventClick} // Manejador para clic en evento
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
      </div>
    </div>
  );
};

export default AdminHome;
