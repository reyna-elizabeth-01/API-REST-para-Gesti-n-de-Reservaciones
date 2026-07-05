const express = require('express');
const router = express.Router();
const {
    crearReservacion,
    obtenerMisReservaciones,
    obtenerTodasReservaciones,
    cambiarEstadoReservacion,
    cancelarPropiaReservacion
} = require('../controles/reservacion.controles');

// Importamos los guardianes creados en el punto anterior
const { verificarToken, esAdmin, esCliente } = require('../middlewares/auth.middlewares');

// Rutas de Clientes
router.post('/', verificarToken, esCliente, crearReservacion);
router.get('/mis', verificarToken, esCliente, obtenerMisReservaciones);
router.delete('/:id', verificarToken, esCliente, cancelarPropiaReservacion);

// Rutas de Administrador
router.get('/', verificarToken, esAdmin, obtenerTodasReservaciones);
router.put('/:id/estado', verificarToken, esAdmin, cambiarEstadoReservacion);

module.exports = router;