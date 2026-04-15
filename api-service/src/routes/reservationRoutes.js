const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAdmin } = require('../middlewares/authMiddleware');

// --- RUTAS PÚBLICAS / INVITADOS ---
router.post('/', reservationController.createReservation);

// --- RUTAS DE USUARIO AUTENTICADO ---
// Obtener sus propias reservas
router.get('/mis-reservas', reservationController.getUserReservations);

// Actualizar cantidad de personas (Ruta que usará el UserDashboard)
// Usamos el mismo controlador updateReservation pero sin el middleware isAdmin
router.put('/update-pax/:id', reservationController.updateReservation);

// --- RUTA COMPARTIDA ---
// Eliminar reserva (La usa el Usuario y el Admin)
router.delete('/:id', reservationController.deleteReservation);

// --- RUTAS EXCLUSIVAS DE ADMINISTRADOR ---
router.get('/admin/all', isAdmin, reservationController.getAllReservations);
router.put('/admin/update/:id', isAdmin, reservationController.updateReservation);

module.exports = router;