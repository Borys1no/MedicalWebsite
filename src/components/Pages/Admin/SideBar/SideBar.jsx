import React from 'react';
import { useAuth } from '../../../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../../Firebase/firebase';
import {
  CalendarDays,
  Settings,
  LogOut,
  ClipboardPlus,
  CircleDollarSign
} from 'lucide-react';
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
  Avatar
} from '@mui/material';

const SideBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
    }
  };

  const menuItems = [
    { text: 'Agenda', icon: <CalendarDays size={20} />, path: '/Admin/Citas/Citas' },
    {text: 'Pagos', icon: <CircleDollarSign size={20} />, path: '#'},
    { text: 'Configuración', icon: <Settings size={20} />, path: '#' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: '#0288D1',
          color: '#fff'
        },
      }}
    >
      <Box>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" component="div">
            Mi Aplicación
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton href={item.path}>
                <ListItemIcon sx={{ minWidth: '40px' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 1 }}>
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="body2" noWrap>
            {currentUser ? currentUser.email : 'Cargando...'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={20} />}
          onClick={handleLogout}
          fullWidth
        >
          Cerrar sesión
        </Button>
      </Box>
    </Drawer>
  );
};

export default SideBar;