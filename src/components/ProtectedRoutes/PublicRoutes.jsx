import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";

const PublicRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) {
    return null; // O un componente de carga
  }

  // Si hay un usuario logueado y es admin, redirigir al dashboard
  if (currentUser && userRole === "admin") {
    return <Navigate to="/dashboard/AdminHome" replace />;
  }

  return children;
};

export default PublicRoute;