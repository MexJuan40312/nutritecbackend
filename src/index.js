// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001;

// ----------------------------
// ✅ CONFIGURACIÓN DE CORS PRO
// ----------------------------

// Define la URL de tu frontend local y de producción
const FRONTEND_DEV_URL = 'http://localhost:3000';
let FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;

// NORMALIZA: quita espacios y punto y coma al final
if (FRONTEND_PROD_URL) {
  FRONTEND_PROD_URL = FRONTEND_PROD_URL.trim().replace(/;$/, '');
}

const allowedOrigins = [FRONTEND_DEV_URL];
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) {
  allowedOrigins.push(FRONTEND_PROD_URL);
}

console.log('✅ Allowed Origins:', allowedOrigins);

// Middleware de CORS aplicado una única vez, simple y eficaz
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`⛔ CORS bloqueado para: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ----------------------------
// ✅ Middlewares útiles
// ----------------------------
app.use(express.json());
app.use(morgan('dev'));

// ----------------------------
// ✅ Rutas unificadas
// ----------------------------
const routes = require('./routes');
app.use('/api', routes);

// ----------------------------
// ✅ Ruta de prueba
// ----------------------------
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡Nutritec backend funcionando OK!' });
});

// ----------------------------
// ✅ 404
// ----------------------------
app.use((req, res) => {
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
  console.log(`✅ Orígenes permitidos: ${allowedOrigins.join(', ')}`);
});
