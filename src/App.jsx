import {
  HashRouter as Router,
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
import PasarelaPago from "./components/Pages/PasarelaPago/PasarelaPago";
import ProfileC from "./components/Pages/ProfileC/ProfileC";
import TransferPayment from "./components/Pages/TransferPayment/TransferPayment";
import Citas from "./components/Pages/Admin/Citas/Citas";
import Resgister from "./components/auth/register/Resgister";
import PagoTransferencia from "./components/Pages/PasarelaPago/PagosTransferencia";
import PagoAdmin from "./components/Pages/Admin/Pagos/AdminPagos";
import PublicRoute from "./components/ProtectedRoutes/PublicRoutes";
import ConfiguracionCitas from "./components/Pages/Admin/settings/ConfiguracionCitas";
import Reportes from "./components/Pages/Admin/Reports/Reportes";
import ProfileSettings from "./components/Pages/ProfileSettings/ProfileSettings";
import ResetPass from "./components/auth/login/resetPass"

const App = () => {
  return (
    
      <Router>
        <Routes>
          {/* Rutas públicas y protegidas con Navbar y Footer */}
          <Route element={<WithNavbarFooter />}>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Navigate to="/Home" />
                </PublicRoute>
              }
            />
            <Route path="/Home" element={
              <PublicRoute>
              <Home />
              </PublicRoute>
              } />
            <Route path="/login" element={<LoginMenu />} />
            <Route path="/resetPass" element={<ResetPass/>} />
            <Route path="/Resgister" element={<Register />} />
            <Route path="/footer" element={<Footer />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cn" element={<PasarelaPago />} />
            <Route path="/ProfileC" element={<ProfileC />} />
            <Route path="/transfer" element={<TransferPayment />} />
            <Route path="/Pagotransferencia" element={<PagoTransferencia />} />
            <Route path="/ProfileSettings" element={<ProfileSettings />} />

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
          <Route
            path="/Admin/Citas/Citas"
            element={
              <ProtectedRoute role="admin">
                <Citas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Pagos"
            element={
              <ProtectedRoute role="admin">
                <PagoAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/settings/ConfiguracionCitas"
            element={
              <ProtectedRoute role="admin">
                <ConfiguracionCitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Admin/Reports/Reportes"
            element={
              <ProtectedRoute role="admin">
                <Reportes />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    
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
