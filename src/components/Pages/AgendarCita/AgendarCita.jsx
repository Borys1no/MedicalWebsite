import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { db } from '../../../Firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AgendarCita.css';

const AgendarCita = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const q = query(collection(db, 'citas'));
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().type === 'NoDisponible' ? 'No Disponible' : 'Reservado',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        color: doc.data().type === 'NoDisponible' ? '#740938' : '#CC2B52',
      }));
      setEvents(appointments);
    };
    fetchAppointments();
  }, []);

  const handleSelect = async (info) => {
    const { start, end } = info;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      Swal.fire('Error', 'No se pueden reservar citas en fechas anteriores al día actual.', 'error');
      return;
    }

    if (start.getHours() === 13) {
      Swal.fire('Error', 'No se pueden reservar citas durante la hora del almuerzo (13:00 - 14:00)', 'error');
      return;
    }

    const q = query(collection(db, 'citas'), where('startTime', '==', start));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      Swal.fire('Error', 'Este horario ya está reservado. Por favor, elige otro.', 'error');
      return;
    }

    setSelectedTimeSlot({ start, end });
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        email: currentUser.email,
      },
    });
    setShowConfirmation(false);
  };

  return (
    <div className="agendar-cita-container">
      <h1>Agendar tu Cita Médica</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotDuration="01:00:00"
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        weekends={false}
        selectable={true}
        height="auto"
        allDaySlot={false}
        select={handleSelect}
        events={events}
        locale={esLocale}
        slotLabelFormat={{ hour: 'numeric', minute: '2-digit' }}
      />
      {showConfirmation && (
        <div className="confirmation-popup">
          <p>
            ¿Seguro que quieres agendar la cita el{' '}
            {selectedTimeSlot.start.toLocaleString()}?
          </p>
          <button onClick={handleProceedToCheckout}>Sí</button>
          <button onClick={handleCancel}>No</button>
        </div>
      )}
    </div>
  );
};

export default AgendarCita;
