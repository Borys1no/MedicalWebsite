import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../Firebase/firebase';
import SideBar from '../SideBar/SideBar';
import './HomeAdmin.css';

const AdminHome = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const querySnapshot = await getDocs(collection(db, 'citas'));
      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: 'Cita Agendada',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        userId: doc.data().userId, // Se añade userId para buscar al paciente
        color: '#5cb85c', // Verde para indicar que está agendado
      }));
      setEvents(appointments);
    };
    fetchAppointments();
  }, []);

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
