import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../Firebase/firebase";
import SideBar from "../SideBar/SideBar";
import Modal from "react-modal";
import Swal from "sweetalert2";
import "./HomeAdmin.css";

// Configura el elemento del modal
Modal.setAppElement("#root");

const AdminHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Función para convertir timestamp de Firestore
  const convertirFecha = (timestamp) => {
    if (!timestamp) return null;
    return typeof timestamp.toDate === "function"
      ? timestamp.toDate()
      : new Date(timestamp);
  };

  // Cargar las citas del calendario
  const fetchAppointments = async (startDate, endDate) => {
    setLoading(true);
    try {
      const q = query(collection(db, "citas"));
      const querySnapshot = await getDocs(q);

      const appointments = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Manejar ambas estructuras de fecha
        const start = convertirFecha(data.startTime || data.fechaCita?.start);
        const end = convertirFecha(data.endTime || data.fechaCita?.end);

        if (!start || !end) {
          console.warn("Cita con fecha inválida:", data);
          return;
        }

        // Filtrar por rango de fechas
        if (start >= startDate && end <= endDate) {
          let title = "Pendiente de pago";
          let color = "#d9534f";

          // Detectar eventos marcados como no disponibles
          if (data.type === "NoDisponible") {
            title = "No Disponible";
            color = "#d9534f";
          } else if (data.estado === "rechazada") {
            title = "Disponible";
            color = "#5bc0de";
          } else if (data.estado === "confirmada") {
            title = "Cita Agendada";
            color = "#5cb85c";
          } else if (data.estado === "pendiente_verificacion") {
            title = "Pendiente de Verificación";
            color = "#f0ad4e";
          }

          appointments.push({
            id: doc.id,
            title: title,
            start: start,
            end: end,
            userId: data.paciente?.identificationNumber || "",
            zoomLink: data.zoomLink || "",
            color: color,
            extendedProps: {
              paciente: data.paciente || {},
              estado: data.estado,
              metodoPago: data.pago?.metodo,
              comprobante: data.pago?.comprobante,
            },
          });
        }
      });

      setEvents(appointments);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    }
    setLoading(false);
  };

  // Actualizar el calendario cuando cambian las fechas visibles
  const handleDatesSet = (arg) => {
    fetchAppointments(arg.start, arg.end);
  };

  // Mostrar modal al hacer clic en un evento
  const handleEventClick = async (clickInfo) => {
    const event = clickInfo.event;

    // Si es un horario marcado como No Disponible
    if (event.title === "No Disponible") {
      try {
        const result = await Swal.fire({
          title: "¿Liberar horario?",
          text: "¿Deseas liberar este horario marcado como No Disponible?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sí, liberar",
          cancelButtonText: "Cancelar",
        });
        if (result.isConfirmed) {
          await deleteUnavailableSlot(event);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo liberar el horario. Por favor, inténtalo de nuevo.",
          icon: "error",
        });
        console.error("Error al liberar el horario:", error);
      }
    }
    // Si es una cita normal
    else {
      setSelectedEvent(event);
      const pacienteInfo = event.extendedProps.paciente;

      if (pacienteInfo) {
        setPatientInfo({
          firstName: pacienteInfo.firstName,
          lastName: pacienteInfo.lastName,
          phoneNumber: pacienteInfo.phoneNumber,
          identificationNumber: pacienteInfo.identificationNumber,
          email: pacienteInfo.email,
          country: pacienteInfo.country,
          city: pacienteInfo.city,
        });
      }

      setIsModalOpen(true);
    }
  };

  const handleEventDelete = async (clickInfo) => {
    const event = clickInfo.event;

    if (event.title === "No Disponible") {
      const confirmDelete = window.confirm(
        "¿Deseas liberar este horario marcado como No Disponible?"
      );

      if (confirmDelete) {
        await deleteUnavailableSlot(event);
      }
    } else {
      // Aquí puedes manejar otros tipos de eventos si lo deseas
      console.log("Este no es un horario marcado como No Disponible");
    }
  };

  // Mostrar modal para marcar como no disponible al hacer clic en un slot vacío
  const handleDateClick = (info) => {
    if (info && info.date) {
      setSelectedSlot(info);
      setIsUnavailableModalOpen(true);
    } else {
      console.error("No se pudo seleccionar el horario.");
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
        title: "No Disponible",
        start: start,
        end: end,
        type: "NoDisponible", // Añadimos el tipo de evento
        color: "#d9534f", // Rojo para indicar no disponible
      };

      try {
        await setDoc(doc(collection(db, "citas")), {
          startTime: newUnavailableEvent.start,
          endTime: newUnavailableEvent.end,
          type: "NoDisponible", // Guardamos el tipo de evento en la base de datos
          userId: null, // Sin `userId` ya que es un horario no disponible
        });
        setEvents((prevEvents) => [...prevEvents, newUnavailableEvent]);
        console.log("Horario marcado como no disponible correctamente.");
      } catch (error) {
        console.error("Error al marcar como no disponible:", error);
      }
    } else {
      console.error(
        "No hay un horario seleccionado para marcar como no disponible o el horario no es válido."
      );
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

  const deleteUnavailableSlot = async (event) => {
    try {
      // Buscar el documento en Firestore que coincide con este evento
      const q = query(
        collection(db, "citas"),
        where("startTime", "==", event.start),
        where("type", "==", "NoDisponible")
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Eliminar cada documento encontrado (debería ser solo uno)
        const deletePromises = querySnapshot.docs.map(async (doc) => {
          await deleteDoc(doc.ref);
        });

        await Promise.all(deletePromises);

        // Actualizar el estado local eliminando el evento
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
        console.log("Horario liberado correctamente.");
      } else {
        console.error(
          "No se encontró el horario no disponible en la base de datos."
        );
      }
    } catch (error) {
      console.error("Error al liberar el horario:", error);
    }
  };

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState({
    start: null,
    end: null,
  });

  const handleReschedule = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const handleNewTimeSelect = (selectedTime) => {
    const endTime = new Date(selectedTime);
    endTime.setHours(endTime.getHours() + 1);

    setNewAppointmentTime({
      start: selectedTime,
      end: endTime,
    });
  };

  const confirmReschedule = async () => {
    if (!newAppointmentTime.start || !selectedEvent) {
      Swal.fire({
        title: "Error",
        text: "Por favor, selecciona una nueva fecha y hora para la cita.",
        icon: "error",
      });
      return;
    }

    try {
      const appointmentRef = doc(db, "citas", selectedEvent.id);
      await setDoc(
        appointmentRef,
        {
          startTime: newAppointmentTime.start,
          endTime: newAppointmentTime.end,
          zoomLink: selectedEvent.extendedProps.zoomLink,
        },
        { merge: true }
      );

      const response = await fetch(
        "https://zoommicroservice.fly.dev/reschedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: selectedEvent.id,
            newStartTime: newAppointmentTime.start.toISOString(),
            userEmail: patientInfo.email, // corregido
            userTimeZone: "America/Guayaquil", // puedes obtenerlo dinámicamente si quieres
            originalZoomLink: selectedEvent.extendedProps.zoomLink,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Error al reagendar la cita en Zoom");
      }

      Swal.fire({
        title: "Exito",
        text: "Cita reagendada correctamente.",
        icon: "success",
      });

      fetchAppointments(new Date(), new Date());

      setIsRescheduleModalOpen(false);
      setSelectedEvent(null);
      setNewAppointmentTime({ start: null, end: null });
    } catch (error) {
      console.error("Error al reagendar la cita:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo reagendar la cita. Por favor, inténtalo de nuevo.",
        icon: "error",
      });
    }
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
          slotMinTime="06:00:00"
          slotMaxTime="19:00:00"
          weekends={false}
          height="auto"
          allDaySlot={false}
          events={events}
          datesSet={handleDatesSet}
          eventClick={handleEventClick} // Manejador
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
              <p>
                <strong>Fecha y Hora:</strong>{" "}
                {new Date(selectedEvent.start).toLocaleString()}
              </p>
              {patientInfo ? (
                <>
                  <p>
                    <strong>Nombre:</strong> {patientInfo.firstName}{" "}
                    {patientInfo.lastName}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {patientInfo.phoneNumber}
                  </p>
                  <p>
                    <strong>Email:</strong> {patientInfo.email}
                  </p>
                </>
              ) : (
                <p>Cargando información del paciente...</p>
              )}
              {/* Mostrar el enlace de Zoom */}
              {selectedEvent.extendedProps.zoomLink && (
                <p>
                  <strong>Enlace de Zoom:</strong>{" "}
                  <a
                    href={selectedEvent.extendedProps.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Unirse a la reunión
                  </a>
                </p>
              )}
              <button
                onClick={() => handleReschedule(selectedEvent)}
                className="reschedule-btn"
              >
                Reagendar Cita
              </button>
              <button onClick={closeModal} className="close-modal-btn">
                Cerrar
              </button>
            </>
          )}
        </Modal>
        {/* Modal para re-agendar cita */}
        <Modal
          isOpen={isRescheduleModalOpen}
          onRequestClose={() => setIsRescheduleModalOpen(false)}
          contentLabel="Re-agendar Cita"
          className="Modal"
          overlayClassName="Overlay"
        >
          <h2>Reagendar Cita</h2>

          <p>Cita actual: {new Date(selectedEvent?.start).toLocaleString()}</p>

          <div className="reschedule-calendar">
            <FullCalendar
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              slotDuration="01:00:00"
              slotMinTime="06:00:00"
              slotMaxTime="19:00:00"
              weekends={false}
              height="auto"
              allDaySlot={false}
              events={events}
              datesSet={handleDatesSet}
              dateClick={(arg) => handleNewTimeSelect(arg.date)}
            />
          </div>

          {newAppointmentTime.start && (
            <p>
              Nueva fecha seleccionada:{" "}
              {newAppointmentTime.start.toLocaleString()}
            </p>
          )}

          <div className="modal-buttons">
            <button
              onClick={confirmReschedule}
              disabled={!newAppointmentTime.start}
              className="confirm-reschedule-btn"
            >
              Confirmar Reagendación
            </button>

            <button
              onClick={() => {
                setIsRescheduleModalOpen(false);
                setIsModalOpen(true);
              }}
              className="cancel-reschedule-btn"
            >
              Cancelar
            </button>
          </div>
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
              <button onClick={markAsUnavailable} className="confirm-modal-btn">
                Confirmar
              </button>
              <button
                onClick={closeUnavailableModal}
                className="close-modal-btn"
              >
                Cancelar
              </button>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminHome;
