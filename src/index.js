// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3001;

// ----------------------------
// ✅ CONFIGURACIÓN DE CORS LIMPIA Y ROBUSTA
// ----------------------------

const FRONTEND_DEV_URL = 'http://localhost:3000';
let FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;
if (FRONTEND_PROD_URL) {
  FRONTEND_PROD_URL = FRONTEND_PROD_URL.trim().replace(/;$/, '');
}

const allowedOrigins = [FRONTEND_DEV_URL];
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) {
  allowedOrigins.push(FRONTEND_PROD_URL);
}

console.log('✅ Allowed Origins:', allowedOrigins);

// ✅ CORS con preflight automático
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`⛔ CORS bloqueado para: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,  // Para proxies antiguos que requieren 200 en preflight
}));

// ✅ Opcional: handler manual para cualquier OPTIONS (garantía doble)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// ----------------------------
// ✅ Otros Middlewares
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
// ✅ Error Handler global
// ----------------------------
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    message: "Algo salió mal en el servidor",
    error: err.message || 'Error interno'
  });
});

// ----------------------------
// ✅ Start server
// ----------------------------
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`✅ Orígenes permitidos: ${allowedOrigins.join(', ')}`);
});
