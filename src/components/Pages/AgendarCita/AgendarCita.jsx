import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '../../../Firebase/firebase'; // Importa tu configuración de Firebase
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../../contexts/authContext'; // Importa el contexto de autenticación si es necesario
import './AgendarCita.css';

const AgendarCita = () => {
  const { currentUser } = useAuth(); // Para obtener el usuario actual
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Cargar las citas desde Firestore cuando el componente se monta
    const fetchAppointments = async () => {
      const q = query(collection(db, 'citas'));
      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.type === 'NoDisponible' ? 'No Disponible' : 'Reservado',
          start: data.startTime.toDate(),
          end: data.endTime.toDate(),
          color: data.type === 'NoDisponible' ? '#740938' : '#AF1740', // Rojo para no disponible, verde para reservado
        };
      });
      setEvents(appointments);
    };
    fetchAppointments();
  }, []);

  const handleSelect = async (info) => {
    const { start, end } = info;
    // Validar que no sea la hora de almuerzo (13:00 - 14:00)
    if (start.getHours() === 13) {
      alert('No se pueden reservar citas durante la hora del almuerzo (13:00 - 14:00)');
      return;
    }

    // Verificar si la cita ya está reservada
    const q = query(
      collection(db, 'citas'),
      where('startTime', '==', start)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      alert('Este horario ya está reservado o no disponible. Por favor, elige otro.');
      return;
    }

    // Si está disponible, mostrar confirmación
    setSelectedTimeSlot({ start, end });
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (currentUser && selectedTimeSlot) {
      try {
        // Almacenar la cita en Firestore
        await addDoc(collection(db, 'citas'), {
          userId: currentUser.uid,
          startTime: selectedTimeSlot.start,
          endTime: selectedTimeSlot.end,
          type: 'Cita', // Tipo de evento como "Cita"
        });
        alert('Cita confirmada');
        setShowConfirmation(false);
        // Actualizar eventos
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            title: 'Reservado',
            start: selectedTimeSlot.start,
            end: selectedTimeSlot.end,
            color: '#5cb85c', // Verde para indicar que está reservado
          },
        ]);
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
      <div className="calendar-container">
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
      </div>
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
