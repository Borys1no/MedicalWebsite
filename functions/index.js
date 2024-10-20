import admin from 'firebase-admin';  // Importación por defecto de ESM
import { onDocumentCreated } from 'firebase-functions/v2/firestore';  // Firebase Functions v2

admin.initializeApp();

export const onOrderCreated = onDocumentCreated('orders/{orderId}', (event) => {
  const newOrder = event.data.data();
  const orderId = event.params.orderId;

  console.log(`Nuevo pedido creado: ${orderId}, Trago: ${newOrder.drink}, Cliente: ${newOrder.customerName}`);

  return null;
});
