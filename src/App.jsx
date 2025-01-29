import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/footer/footer";
import Home from "./components/Pages/Home/Home";
import { AuthProvider } from "./contexts/authContext";
import LoginMenu from "./components/auth/login/index";
import Register from "./components/auth/register/index";
import AdminHome from "./components/Pages/Admin/AdminHome/HomeAdmin";
import ProtectedRoute from "./components/ProtectedRoutes/ProtectedRoutes";
import ProtectedRouteGeneral from "./components/ProtectedRoutes/ProtectedRouteGeneral";
import AgendarCita from "./components/Pages/AgendarCita/AgendarCita";
import Checkout from "./components/Pages/CheckOut/checkout";
import PasarelaPago from './components/Pages/PasarelaPago/PasarelaPago';
import ProfileC from "./components/Pages/ProfileC/ProfileC";
import TransferPayment from "./components/Pages/TransferPayment/TransferPayment"

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas y protegidas con Navbar y Footer */}
          <Route element={<WithNavbarFooter />}>
            <Route path="/" element={<Navigate to="/Home" />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<LoginMenu />} />
            <Route path="/register" element={<Register />} />
            <Route path="/footer" element={<Footer />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cn" element={<PasarelaPago />} />
            <Route path="/ProfileC" element={<ProfileC/>} />
            <Route path="/transfer" element={<TransferPayment/>} />

            {/* Ruta protegida para agendar cita, requiere login */}
            <Route
              path="/AgendarCita"
              element={
                <ProtectedRouteGeneral>
                  <AgendarCita />
                </ProtectedRouteGeneral>
              }
            />
          </Route>

          {/* Rutas protegidas para Admin con Navbar y SideBar */}
          <Route
            path="/dashboard/AdminHome"
            element={
              <ProtectedRoute role="admin">
                <AdminHome />
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
