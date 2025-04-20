import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { db } from "../../../Firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./AgendarCita.css";

const AgendarCita = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [events, setEvents] = useState([]);
  const [hasFutureAppointments, setHasFutureAppointments] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, "citas"));
        const querySnapshot = await getDocs(q);

        const convertirFecha = (timestamp) => {
          if (!timestamp) return null;
          return typeof timestamp.toDate === "function"
            ? timestamp.toDate()
            : new Date(timestamp);
        };

        const appointments = [];
        let userHasFutureAppointment = false;
        const now = new Date();

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const start = convertirFecha(data.startTime || data.fechaCita?.start);
          const end = convertirFecha(data.endTime || data.fechaCita?.end);

          // Verifica si el usuario tiene una cita futura
          if (
            currentUser &&
            data.email === currentUser.email &&
            start > now
          ) {
            userHasFutureAppointment = true;
          }
          if (!start || !end) {
            console.warn("Cita con fecha inválida:", data);
            return; // omitir esta cita
          }
          

          // Mostrar todas las citas registradas como RESERVADO
          appointments.push({
            id: doc.id,
            title: "RESERVADO",
            start,
            end,
            backgroundColor: "#c80303",
            borderColor: "#c80303",
            textColor: "#FFFFFF",
            editable: false,
            overlap: false,
          });
        });

        setEvents(appointments);
        console.log("Citas:", appointments);
        setHasFutureAppointments(userHasFutureAppointment);
      } catch (error) {
        console.error("Error al cargar citas:", error);
        Swal.fire(
          "Error",
          "No se pudieron cargar las citas existentes",
          "error"
        );
      }
    };

    fetchAppointments();
  }, [currentUser]);

  const handleSelect = async (info) => {
    const { start, end } = info;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      Swal.fire(
        "Error",
        "No se pueden reservar citas en fechas anteriores al día actual.",
        "error"
      );
      return;
    }

    if (start.getHours() === 13) {
      Swal.fire(
        "Error",
        "No se pueden reservar citas durante la hora del almuerzo (13:00 - 14:00)",
        "error"
      );
      return;
    }

    const q = query(collection(db, "citas"), where("startTime", "==", start));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      Swal.fire(
        "Error",
        "Este horario ya está reservado. Por favor, elige otro.",
        "error"
      );
      return;
    }

    setSelectedTimeSlot({ start, end });
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleProceedToCheckout = () => {
    navigate("/checkout", {
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
        slotLabelFormat={{ hour: "numeric", minute: "2-digit" }}
      />
      {showConfirmation && (
        <div className="confirmation-popup">
          <p>
            ¿Seguro que quieres agendar la cita el{" "}
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
