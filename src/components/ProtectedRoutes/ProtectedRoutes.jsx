import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";
import { db } from "../../Firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const ProtectedRoute = ({ role, children }) => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          console.error("No se encontro el documento del usuario. ");
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, [currentUser]);
  if (loading) {
    return <div>Cargando...</div>;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== role) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default ProtectedRoute;
