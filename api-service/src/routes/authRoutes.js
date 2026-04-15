const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// --- RUTAS DE GOOGLE ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173?error=login_failed' }),
  (req, res) => res.redirect('http://localhost:5173/')
);

// --- NUEVA RUTA: REGISTRO CLÁSICO ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Validación de seguridad básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // 2. Verificamos si el correo ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // 3. Encriptamos la contraseña (le damos 10 vueltas de seguridad)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Creamos al usuario
    const newUser = await User.create({ name, email, password: hashedPassword });

    // 5. Lo iniciamos en sesión automáticamente (Reparado para que no apague el servidor si falla)
    req.login(newUser, (err) => {
      if (err) {
        console.error("Error iniciando sesión tras registro:", err);
        return res.status(500).json({ message: 'Cuenta creada, pero falló el inicio de sesión.' });
      }
      return res.status(201).json({ message: 'Registro exitoso', user: newUser });
    });

  } catch (error) {
    console.error("Error real del servidor:", error);
    
    // Si Mongoose choca por un dato duplicado que no vimos (Error 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Error de Base de Datos: Ya existe un registro con esos datos.' });
    }

    // AHORA SÍ ENVIAMOS EL MENSAJE REAL AL FRONTEND
    res.status(500).json({ message: error.message });
  }
});

// --- NUEVA RUTA: LOGIN CLÁSICO ---
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Error interno en el servidor.' });
    
    // Si la contraseña está mala o no existe el correo, mandamos el error real
    if (!user) return res.status(401).json({ message: info?.message || 'Credenciales incorrectas' }); 
    
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Error al crear sesión' });
      res.json({ message: 'Login exitoso', user });
    });
  })(req, res, next);
});

// --- RUTAS DE SESIÓN ---
router.get('/current-user', (req, res) => res.send(req.user));

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.send({ message: 'Sesión cerrada' });
  });
});

module.exports = router;