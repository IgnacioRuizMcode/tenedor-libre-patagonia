const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy; // NUEVO
const bcrypt = require('bcryptjs'); // NUEVO
const User = require('../models/User');

// --- 1. ESTRATEGIA DE GOOGLE (La que ya tenías) ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
      } else if (!user.googleId) {
        // Si ya existía con correo, le enlazamos su cuenta de Google
        user.googleId = profile.id;
        user.avatar = profile.photos[0].value;
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// --- 2. ESTRATEGIA CLÁSICA (Correo y Contraseña) ---
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    // Buscamos al usuario por correo
    const user = await User.findOne({ email });
    if (!user) {
      return done(null, false, { message: 'El correo no está registrado.' });
    }
    if (!user.password) {
      return done(null, false, { message: 'Esta cuenta usa inicio de sesión con Google.' });
    }

    // Comparamos la contraseña desencriptándola
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Contraseña incorrecta.' });
    }

    return done(null, user); // Todo correcto, lo dejamos pasar
  } catch (error) {
    return done(error);
  }
}));

// --- SERIALIZACIÓN DE SESIÓN ---
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});