const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // sparse: true permite que usuarios clásicos no tengan googleId sin que la BD explote
  googleId: { type: String, unique: true, sparse: true }, 
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Campo para los que se registran con correo
  avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' } // Foto por defecto
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// ✨ TRUCO DE MAGIA: Sincroniza los índices de MongoDB automáticamente
// Borra las reglas viejas que hacen chocar a los usuarios de Google con los Clásicos.
User.syncIndexes();

module.exports = User;