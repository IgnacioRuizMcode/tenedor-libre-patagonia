const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`📡 MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error en conexión a BD: ${error.message}`);
    process.exit(1); // Detener el servidor si falla la conexión
  }
};

module.exports = connectDB;