import React, { useState } from "react";
import { useAuth } from "../../../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../../Firebase/firebase";
import {
  CalendarDays,
  Settings,
  LogOut,
  ClipboardPlus,
  CircleDollarSign,
  Menu,
  X,
  FolderDown
} from "lucide-react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const SideBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  const menuItems = [
    {
      text: "Inicio",
      icon: <ClipboardPlus size={20} />,
      path: "/dashboard/AdminHome",
    },
    {
      text: "Agenda",
      icon: <CalendarDays size={20} />,
      path: "/Admin/Citas/Citas",
    },
    {
      text: "Pagos",
      icon: <CircleDollarSign size={20} />,
      path: "/Admin/Pagos",
    },
    { text: "Configuración",
      icon: <Settings size={20} />, 
      path: "/Admin/settings/ConfiguracionCitas" 
    },
    { text: "Reportes",
      icon: <FolderDown size={20} />, 
      path: "/Admin/Reports/Reportes" 
    },
  ];

  return (
    <>
      {/* Botón de hamburguesa solo en móvil */}
      {isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: theme.zIndex.drawer + 1, // Encima del Drawer
            color: "#fff",
            backgroundColor: "#0288D1",
            "&:hover": { backgroundColor: "#0277BD" },
          }}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </IconButton>
      )}

      {/* Drawer responsivo */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "#0288D1",
            color: "#fff",
            position: "fixed",
            top: 0,
            height: "100vh",
            zIndex: theme.zIndex.drawer,
            ...(!isMobile && {
              position: "relative", // Comportamiento normal en desktop
            }),
          },
        }}
      >
        <Box>
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" component="div">
              ReumaSur Administrador
            </Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  href={item.path}
                  onClick={isMobile ? handleDrawerToggle : null} // Cierra el drawer en móvil al seleccionar
                >
                  <ListItemIcon sx={{ minWidth: "40px", color: "#fff" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ mr: 1 }}>
              {currentUser?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" noWrap>
              {currentUser ? currentUser.email : "Cargando..."}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogOut size={20} />}
            onClick={handleLogout}
            fullWidth
            sx={{
              color: "#fff",
              borderColor: "#fff",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default SideBar;
