import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../Firebase/firebase';
import SideBar from '../SideBar/SideBar';
import Modal from 'react-modal'; // Importamos la librería Modal
import './HomeAdmin.css';

Modal.setAppElement('#root'); // Establecemos el elemento raíz para el modal

const AdminHome = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, 'citas'));
      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: 'Cita Agendada',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        color: '#5cb85c', // Verde para indicar que está agendado
      }));
      setEvents(appointments);
    };
    fetchAppointments();
  }, []);

  const handleEventClick = async (clickInfo) => {
    // Obtenemos los detalles del documento correspondiente a la cita seleccionada
    const docRef = doc(db, 'citas', clickInfo.event.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const eventDetails = docSnap.data();
      setSelectedEvent({
        nombres: eventDetails.nombres,
        telefono: eventDetails.telefono,
      });
      setIsModalOpen(true);
    } else {
      console.error('No se encontró el documento de la cita.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="admin-container">
      <SideBar />
      <div className="content">
        <h1 className="txt-title">Bienvenido administrador</h1>
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
          eventClick={handleEventClick} // Añadimos el handler para el click
        />
      </div>
      
      {isModalOpen && selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Detalles de la Cita"
          className="Modal"
          overlayClassName="Overlay"
        >
          <h2>Detalles de la Cita</h2>
          <p><strong>Nombres:</strong> {selectedEvent.nombres}</p>
          <p><strong>Teléfono:</strong> {selectedEvent.telefono}</p>
          <button onClick={closeModal} className="close-btn">Cerrar</button>
        </Modal>
      )}
    </div>
  );
};

export default AdminHome;
