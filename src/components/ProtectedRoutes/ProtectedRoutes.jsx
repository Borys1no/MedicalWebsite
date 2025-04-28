import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate, useLocation } from "react-router-dom";
import { db } from "../../Firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ role, children }) => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          console.error("No se encontró el documento del usuario.");
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, [currentUser]);

  // Lista de rutas permitidas para admin
  const adminAllowedRoutes = [
    '/dashboard',
    '/dashboard/AdminHome',
    '/Admin/Citas/Citas',
    '/Admin/Pagos'
  ];

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si es admin y está intentando acceder a una ruta no permitida
  if (userRole === 'admin' && !adminAllowedRoutes.some(route => location.pathname.startsWith(route))) {
    return <Navigate to="/dashboard/AdminHome" replace />;
  }

  // Verificación de roles para rutas protegidas
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'admin' ? "/dashboard/AdminHome" : "/Home"} replace />;
  }

  return children;
};

export default ProtectedRoute;