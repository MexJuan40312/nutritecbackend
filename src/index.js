// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Asegúrate de que esté importado
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001;

// --- Configuración de CORS ---
const FRONTEND_DEV_URL = 'http://localhost:3000';
const FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;

const allowedOrigins = [FRONTEND_DEV_URL];
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) {
  allowedOrigins.push(FRONTEND_PROD_URL);
}

// **¡MOVER ESTO AL PRINCIPIO, ANTES DE express.json()!**
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS Error: Origin ${origin} not allowed by policy.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json()); // **AHORA ESTO VA DESPUÉS DE CORS**
app.use(morgan('dev'));

// Rutas unificadas
const routes = require('./routes');
app.use('/api', routes);

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
app.listen(port, '0.0.0.0', () => { // Añade '0.0.0.0' aquí también, es una buena práctica para Railway
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`CORS permitiendo los orígenes: ${allowedOrigins.join(', ')}`);
});