import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/footer/footer"; // Import the Footer component
import Home from "./components/Pages/Home/Home";
import { AuthProvider } from "./contexts/authContext"; // Importa tu AuthProvider
import LoginMenu from "./components/auth/login";
import Register from "./components/auth/register";
import AdminHome from "./components/pages/Admin/AdminHome/HomeAdmin";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";

const App = () => {
  return (
    <AuthProvider>
      {" "}
      {/* Envuelve la app con el AuthProvider */}
      <Router>
        <Routes>
          {/* Rutas públicas con Navbar */}
          <Route element={<WithNavbar />}>
            <Route path="/" element={<Navigate to="/Home" />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<LoginMenu />} />
            <Route path="/register" element={<Register />} />
            {/* Otras rutas aquí */}

            {/* Rutas protegidas sin Navbar */}
            <Route
              path="/dashboard/AdminHome"
              element={
                <ProtectedRoute role="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Componente para las rutas que incluyen el Navbar y Footer
const WithNavbar = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Aquí se renderizan los componentes hijos */}
      <Footer /> {/* Footer added here to be displayed on all pages with the Navbar */}
    </>
  );
};

export default App;
