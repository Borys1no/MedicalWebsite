import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Importa ThemeProvider
import App from './App.jsx';
import { AuthProvider } from './contexts/authContext/index.jsx';
import './index.css';

// Crea un tema básico (puedes personalizarlo)
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,  // Este es el breakpoint que usas con `down("md")`
      lg: 1200,
      xl: 1536,
    },
  },
  // Añade otras personalizaciones de tema si lo necesitas
});

createRoot(document.getElementById('root')).render(
  //<StrictMode>
    <ThemeProvider theme={theme}> {/* Envuelve todo con ThemeProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  //</StrictMode>
);