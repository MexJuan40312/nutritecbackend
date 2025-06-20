require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001; // Usa el puerto de .env o 3001 por defecto

// URL del frontend en desarrollo
const FRONTEND_DEV_URL = 'http://localhost:3000';
// URL del frontend en producción
const FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;

// Crea una lista de orígenes permitidos
const allowedOrigins = [FRONTEND_DEV_URL];
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) { 
  allowedOrigins.push(FRONTEND_PROD_URL);
}

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json()); 

// Middleware de CORS aplicado una única vez al principio
app.use(cors({
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como Postman/cURL) o del mismo origen del servidor
    if (!origin) return callback(null, true);

    // Si el origen de la solicitud está en nuestra lista de permitidos
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Si el origen no está permitido, rechaza la solicitud
      console.warn(`CORS Error: Origin ${origin} not allowed by policy.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Permite manejar cookies, tokens de autorización, etc.
}));

// Logger de peticiones HTTP (muestra logs en consola)
app.use(morgan('dev')); 

// Rutas unificadas
const routes = require('./routes');
app.use('/api', routes); // Todas tus rutas ahora se acceden con el prefijo /api

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

// Manejador de errores general
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Algo salió mal en el servidor", error: err.message });
});

// Ruta de prueba para la raíz
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡El backend de Nutritec está funcionando!' });
});

// Levantar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`CORS permitiendo los orígenes: ${allowedOrigins.join(', ')}`);
});