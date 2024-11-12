// src/assets/js/indexPagoPlux.js

function iniciarDatos(dataPago) {
    if (window.Data) {
      window.Data.init(dataPago);
    } else {
      console.error("Data no está definida. Asegúrate de que el script de PagoPlux se ha cargado correctamente.");
    }
  }
  
  function reload(data) {
    if (window.Data) {
      window.Data.reload(data);
    }
  }
  
  window.iniciarDatos = iniciarDatos;
  window.reload = reload;
  