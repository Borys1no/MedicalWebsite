import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Asegúrate de importar getStorage

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD7RuKIHDWaV05Hzb445eGlHd06IQIgGFo",
  authDomain: "medicalproject-20db6.firebaseapp.com",
  projectId: "medicalproject-20db6",
  storageBucket: "medicalproject-20db6.appspot.com",
  messagingSenderId: "32764907251",
  appId: "1:32764907251:web:7cc0341d89aec6c4ddb186",
  measurementId: "G-RB069F5ZVW",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Configura Firebase Storage

export { auth, db, storage }; // Asegúrate de exportar 'storage'
