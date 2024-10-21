import admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import axios from 'axios';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();

const ZOOM_OAUTH_TOKEN = "lZEC11RYbcP71Zm0enQJEOrWhKvdqIMq";

// Escuchar la creación de un pedido en la colección `orders`
export const onOrderCreated = onDocumentCreated('orders/{orderId}', async (event) => {
  const newOrder = event.data.data();
  const orderId = event.params.orderId;

  console.log(`Nuevo pedido creado: ${orderId}, Trago: ${newOrder.drink}, Cliente: ${newOrder.customerName}`);

  return null;
});

// Crear una reunión de Zoom cuando se solicite desde el frontend
export const createZoomMeeting = onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }

  const { date, time } = data;
  const startTime = `${date}T${time}:00Z`;

  const meetingDetails = {
    topic: "Cita Médica",
    type: 2,
    start_time: startTime,
    duration: 30,
    timezone: "UTC",
  };

  try {
    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingDetails,
      {
        headers: {
          "Authorization": `Bearer ${ZOOM_OAUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { zoomLink: response.data.join_url };
  } catch (error) {
    console.error("Error al crear la reunión de Zoom:", error.message);
    throw new HttpsError(
      'internal',
      'Error creating Zoom meeting',
      error.message
    );
  }
});
