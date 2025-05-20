const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const cors = require("cors")({ origin: true });

exports.pagopluxProxy = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      // Valida parámetros requeridos
      if (!req.query.email || !req.query.codigoFile) {
        return res.status(400).json({ 
          error: "Parámetros faltantes", 
          required: ["email", "codigoFile"] 
        });
      }

      const { email, codigoFile, typeFile = "W", inputPhone = "MA==", sandbox = "true" } = req.query;

      // Configura URLs
      const baseUrl = sandbox === "false" 
        ? "https://api.pagoplux.com" 
        : "https://apipre.pagoplux.com";

      // Llama a PagoPlux con timeout
      const response = await axios.get(
        `${baseUrl}/estv1/establishment/getEstablishmentByEmailPayboxResource`,
        {
          params: { email, codigoFile, typeFile, inputPhone },
          timeout: 10000 // 10 segundos máximo
        }
      );

      // Devuelve solo datos necesarios
      res.status(200).json({
        success: true,
        data: response.data
      });

    } catch (error) {
      console.error("Error en proxy:", error);
      
      // Respuesta de error estructurada
      res.status(500).json({
        success: false,
        error: error.message,
        details: {
          axiosError: error.isAxiosError ? {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
          } : null
        }
      });
    }
  });
});