import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./components/Pages/Home/Home";
import { AuthProvider } from "./contexts/authContext";
import LoginMenu from "./components/auth/login";
import Register from "./components/auth/register";
import AdminHome from "./components/pages/Admin/AdminHome/HomeAdmin";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import SideBar from "./components/pages/Admin/SideBar/SideBar";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas con Navbar y Footer */}
          <Route element={<WithNavbarFooter />}>
            <Route path="/" element={<Navigate to="/Home" />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<LoginMenu />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Rutas protegidas para Admin con Navbar y SideBar */}
          <Route
            path="/dashboard/AdminHome"
            element={
              <ProtectedRoute role="admin">
                <WithNavbarAndSidebar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Componente para las rutas que incluyen el Navbar y el Footer
const WithNavbarFooter = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

// Componente para las rutas protegidas que incluyen el Navbar y el Sidebar
const WithNavbarAndSidebar = () => {
  return (
    <>
      <div style={{ display: "flex" }}>
        <SideBar />
        <div style={{ flex: 1, marginLeft: "250px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default App;
