import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AuthForm from "./components/LoginRegister";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";  // Asegúrate de que este es el path correcto a tu archivo firebase.js

function App() {
  return(
    <div className="App">
      <h1>Bienvenido</h1>
      <AuthForm/>

    </div>
  );
}

export default App;
