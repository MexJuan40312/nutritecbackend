// backend/index.js
// Carga las variables de entorno del archivo .env al inicio
require('dotenv').config();

// Importa los módulos necesarios
const express = require('express');
const cors = require('cors'); // Middleware para Cross-Origin Resource Sharing
const morgan = require('morgan'); // Middleware para logging de peticiones HTTP

// Inicializa la aplicación Express
const app = express();

// Define el puerto del servidor. Usará el puerto de la variable de entorno PORT,
// o 3001 por defecto si no está definido (útil para desarrollo local).
const port = process.env.PORT || 3001;

// --- Configuración de CORS ---
// Define la URL de tu frontend en desarrollo (para pruebas locales)
const FRONTEND_DEV_URL = 'http://localhost:3000';
// Define la URL de tu frontend en producción. Esta se leerá de las variables de entorno
// en Railway (FRONTEND_PUBLIC_URL).
const FRONTEND_PROD_URL = process.env.FRONTEND_PUBLIC_URL;

// Crea una lista de orígenes permitidos. Inicialmente incluye el de desarrollo.
const allowedOrigins = [FRONTEND_DEV_URL];

// Si la URL de producción está definida y no es igual a la de desarrollo, la añade a los orígenes permitidos.
// Esto evita duplicados si ambas URLs fueran las mismas por alguna razón.
if (FRONTEND_PROD_URL && FRONTEND_PROD_URL !== FRONTEND_DEV_URL) {
  allowedOrigins.push(FRONTEND_PROD_URL);
}

// **¡ORDEN CRÍTICO DE MIDDLEWARES!**
// 1. CORS: Este middleware DEBE ir primero.
// Maneja las solicitudes preflight (OPTIONS) y añade las cabeceras
// 'Access-Control-Allow-Origin' a las respuestas. Si no va primero,
// 'express.json()' podría intentar procesar solicitudes OPTIONS vacías,
// resultando en un 400 Bad Request.
app.use(cors({
  // Función 'origin' para controlar dinámicamente qué orígenes están permitidos.
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como Postman/cURL) o del mismo origen del servidor.
    // Esto es útil para herramientas de desarrollo o para peticiones desde el mismo servidor.
    if (!origin) return callback(null, true);

    // Si el origen de la solicitud está en nuestra lista de permitidos.
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Permite la solicitud.
    } else {
      // Si el origen no está permitido, rechaza la solicitud y registra una advertencia.
      console.warn(`CORS Error: Origin ${origin} not allowed by policy.`);
      callback(new Error('Not allowed by CORS')); // Rechaza la solicitud con un error.
    }
  },
  credentials: true // Importante para permitir el envío de cookies, tokens de autorización, etc.
}));

// 2. express.json(): Este middleware va DESPUÉS de CORS.
// Es necesario para que Express pueda parsear los cuerpos de las solicitudes entrantes
// que tienen el Content-Type 'application/json'.
app.use(express.json());

// 3. morgan: Middleware para logging de peticiones HTTP.
// 'dev' es un formato conciso para el desarrollo.
app.use(morgan('dev'));

// Rutas unificadas: Carga el archivo de rutas principal (routes/index.js)
// y prefija todas las rutas definidas en él con '/api'.
// Por ejemplo, si tienes una ruta '/auth/login' en tus auth.routes.js,
// la URL final para el cliente será '/api/auth/login'.
const routes = require('./routes');
app.use('/api', routes);

// Manejo de rutas no encontradas (404 Not Found):
// Este middleware se ejecuta si ninguna de las rutas definidas anteriormente
// coincide con la solicitud.
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

// Manejador de errores general:
// Este middleware captura cualquier error que ocurra en la cadena de middleware
// o en los controladores de ruta.
app.use((err, req, res, next) => {
  console.error(err.stack); // Imprime el stack trace del error en la consola del servidor.
  res.status(500).json({ message: "Algo salió mal en el servidor", error: err.message });
});

// Ruta de prueba para la raíz del backend:
// Si alguien accede a la URL base del backend (ej. https://tu-backend.up.railway.app/),
// recibirá este mensaje para confirmar que el servidor está activo.
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡El backend de Nutritec está funcionando!' });
});

// Levantar servidor:
// La aplicación Express empieza a escuchar en el puerto definido.
// '0.0.0.0' es crucial para despliegues en contenedores como Railway,
// ya que le dice al servidor que escuche en todas las interfaces de red disponibles.
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  // Muestra los orígenes CORS permitidos en los logs del servidor para depuración.
  console.log(`CORS permitiendo los orígenes: ${allowedOrigins.join(', ')}`);
});
