import React from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";

const ProtectedRouteGeneral = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirige al login si no hay un usuario autenticado
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRouteGeneral;
