// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7RuKIHDWaV05Hzb445eGlHd06IQIgGFo",
  authDomain: "medicalproject-20db6.firebaseapp.com",
  projectId: "medicalproject-20db6",
  storageBucket: "medicalproject-20db6.appspot.com",
  messagingSenderId: "32764907251",
  appId: "1:32764907251:web:7cc0341d89aec6c4ddb186",
  measurementId: "G-RB069F5ZVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export {auth, db};