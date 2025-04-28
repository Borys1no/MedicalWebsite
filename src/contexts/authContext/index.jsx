import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../Firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/firebase";
import { doSignOut } from "../../Firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // Nuevo estado para el rol
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      
      // Obtener el rol del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      }

      // Check if provider is email and password login
      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserRole(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  async function logout() {
    try {
      await doSignOut();
      setCurrentUser(null);
      setUserRole(null);
      setUserLoggedIn(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const value = {
    currentUser,
    userRole, // Añadimos el rol al contexto
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    loading,
    setCurrentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}