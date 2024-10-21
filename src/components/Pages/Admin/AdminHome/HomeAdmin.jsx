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
    </div>
  );
};

export default AdminHome;
