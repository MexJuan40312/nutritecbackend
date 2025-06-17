// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001;

// ----------------------------
// ✅ CONFIGURACIÓN DE CORS ROBUSTA
// ----------------------------

// Define la URL de tu frontend local y de producción
const FRONTEND_DEV_URL = 'http://localhost:3000';
const FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;

// Lista de orígenes permitidos
const allowedOrigins = [FRONTEND_DEV_URL];
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) {
  allowedOrigins.push(FRONTEND_PROD_URL);
}

console.log("Allowed Origins:", allowedOrigins);

// Middleware de CORS configurado a nivel global
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Permitir Postman y curl

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`⛔ CORS bloqueado para: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ✅ MUY IMPORTANTE: responder correctamente preflight OPTIONS
app.options('*', cors(corsOptions));

// ----------------------------
// ✅ Middlewares útiles
// ----------------------------

app.use(express.json());
app.use(morgan('dev'));

// ----------------------------
// ✅ RUTAS
// ----------------------------

const routes = require('./routes');
app.use('/api', routes);

// ----------------------------
// ✅ RUTA DE PRUEBA
// ----------------------------

app.get('/', (req, res) => {
  res.status(200).json({ message: '¡El backend de Nutritec está funcionando correctamente!' });
});

// ----------------------------
// ✅ Manejo de 404
// ----------------------------

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

// ----------------------------
// ✅ Manejador global de errores
// ----------------------------

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    message: "Algo salió mal en el servidor",
    error: err.message || 'Error interno'
  });
});

// ----------------------------
// ✅ Levantar servidor
// ----------------------------

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`✅ CORS habilitado para: ${allowedOrigins.join(', ')}`);
});
