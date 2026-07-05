const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerPerfil } = require('../controles/auth.controles');
const { verificarToken } = require('../middlewares/auth.middlewares');

// Rutas públicas
router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

// Ruta protegida
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;