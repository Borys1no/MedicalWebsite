import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../Firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doSignOut } from "../../Firebase/auth"; // Asegúrate de importar doSignOut

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
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

      // Check if provider is email and password login
      const isEmail = user.providerData.some(
        (provider) => provider.providerId === "password"
      );
      setIsEmailUser(isEmail);

      // Check if the auth provider is google or not
      // const isGoogle = user.providerData.some(
      //   (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      // );
      // setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }

    setLoading(false);
  }

  // Función para cerrar sesión
  async function logout() {
    try {
      await doSignOut(); // Llamamos al método para cerrar sesión
      setCurrentUser(null); // Limpiamos el estado del usuario
      setUserLoggedIn(false); // Actualizamos el estado de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const value = {
    currentUser,
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    setCurrentUser,
    logout, // Añadimos el método logout al objeto value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
