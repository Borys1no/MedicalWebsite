import { initializeApp, getApps, getApp } from "firebase/app"; // Importa getApps y getApp
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD7RuKIHDWaV05Hzb445eGlHd06IQIgGFo",
  authDomain: "medicalproject-20db6.firebaseapp.com",
  projectId: "medicalproject-20db6",
  storageBucket: "medicalproject-20db6.firebasestorage.app",
  messagingSenderId: "32764907251",
  appId: "1:32764907251:web:7cc0341d89aec6c4ddb186",
  measurementId: "G-RB069F5ZVW"
};

// Inicialización condicional
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };