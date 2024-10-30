import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '../../../Firebase/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../../contexts/authContext';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para redirigir al usuario
import './AgendarCita.css';

const AgendarCita = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate(); // Creamos el hook para navegar entre rutas
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const q = query(collection(db, 'citas'));
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().isUnavailable ? 'No Disponible' : 'Reservado',
        start: doc.data().startTime.toDate(),
        end: doc.data().endTime.toDate(),
        color: doc.data().isUnavailable ? '#dc3545' : '#d9534f', // Rojo oscuro para no disponible, rojo claro para reservado
      }));
      setEvents(appointments);
    };
    fetchAppointments();
  }, []);

  const handleSelect = async (info) => {
    const { start, end } = info;
    if (start.getHours() === 13) {
      alert('No se pueden reservar citas durante la hora del almuerzo (13:00 - 14:00)');
      return;
    }

    const q = query(collection(db, 'citas'), where('startTime', '==', start));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert('Este horario ya está reservado. Por favor, elige otro.');
      return;
    }

    setSelectedTimeSlot({ start, end });
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (currentUser && selectedTimeSlot) {
      try {
        // Guardamos la cita en Firestore
        const newDoc = await addDoc(collection(db, 'citas'), {
          userId: currentUser.uid,
          startTime: selectedTimeSlot.start,
          endTime: selectedTimeSlot.end,
        });

        // Redirigimos al componente Checkout después de confirmar la cita
        navigate('/checkout', {
          state: {
            appointmentId: newDoc.id,
            startTime: selectedTimeSlot.start,
            endTime: selectedTimeSlot.end,
          },
        });

        setShowConfirmation(false);
      } catch (error) {
        console.error('Error al agendar la cita: ', error);
      }
    } else {
      alert('Debes iniciar sesión para agendar una cita.');
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="agendar-cita-container">
      <h1>Agendar tu Cita Médica</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        slotDuration="01:00:00"
        slotMinTime="08:00:00"
        slotMaxTime="17:00:00"
        weekends={false}
        selectable={true}
        height="auto"
        allDaySlot={false}
        select={handleSelect}
        events={events}
      />
      {showConfirmation && (
        <div className="confirmation-popup">
          <p>
            ¿Seguro que quieres agendar la cita el{' '}
            {selectedTimeSlot.start.toLocaleString()}?
          </p>
          <button onClick={handleConfirm}>Sí</button>
          <button onClick={handleCancel}>No</button>
        </div>
      )}
    </div>
  );
};

export default AgendarCita;
