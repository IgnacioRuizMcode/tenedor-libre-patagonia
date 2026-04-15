const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Nuevas dependencias para el Login
const session = require('express-session');
const passport = require('passport');

// Importaciones internas
const connectDB = require('./config/db');
require('./config/passport'); // Ejecuta la configuración de Google
const reservationRoutes = require('./routes/reservationRoutes');
const authRoutes = require('./routes/authRoutes'); // Rutas de autenticación

const app = express();

// Conectar a la Base de Datos
connectDB(); 

// --- MIDDLEWARES GLOBALES ---
app.use(helmet()); 
app.use(morgan('dev')); 

// ⚠️ MUY IMPORTANTE: Para que Google y React se entiendan, CORS debe permitir "credenciales"
app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
})); 

app.use(express.json()); 

// --- CONFIGURACIÓN DE SESIONES Y SEGURIDAD ---
// Esto hace que el servidor "recuerde" quién inició sesión
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Inicializamos al "guardia" que habla con Google
app.use(passport.initialize());
app.use(passport.session());

// --- RUTAS DE LA APLICACIÓN ---
// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({ message: 'API de Brasas El Tepual en línea', version: '1.0.0' });
});

// Ruta de Reservas
app.use('/api/reservas', reservationRoutes);

// Ruta de Google (NUEVA)
app.use('/api/auth', authRoutes); 

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor profesional corriendo en puerto ${PORT}`);
});