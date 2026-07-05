const express = require('express');
const router = express.Router();
const { 
    obtenerMesas, 
    obtenerMesaById, 
    crearMesa, 
    actualizarMesa, 
    desactivarMesa 
} = require('../controles/mesa.controles');

// Importamos los middlewares de protección
const { verificarToken, esAdmin } = require('../middlewares/auth.middlewares');

// --- RUTAS PÚBLICAS ---
router.get('/', obtenerMesas);
router.get('/:id', obtenerMesaById);

// --- RUTAS PROTEGIDAS (Solo Administradores) ---
// Primero se verifica el token, luego si es admin, y finalmente corre el controlador
router.post('/', verificarToken, esAdmin, crearMesa);
router.put('/:id', verificarToken, esAdmin, actualizarMesa);
router.delete('/:id', verificarToken, esAdmin, desactivarMesa);

module.exports = router;