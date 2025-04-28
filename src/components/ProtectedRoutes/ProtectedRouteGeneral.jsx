import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/authContext";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/firebase";

const ProtectedRouteGeneral = ({ children }) => {
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
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, [currentUser]);

  if (loading) return <div>Cargando...</div>;
  

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole === "admin") {
    return <Navigate to="/dashboard/AdminHome" replace />;
  }

  return children;
};

export default ProtectedRouteGeneral;
