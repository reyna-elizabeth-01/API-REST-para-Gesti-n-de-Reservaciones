const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// 1. MIDDLEWARE GLOBAL: Verificar si el token JWT es válido
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: No se proporcionó un token' });
    }

    try {
        const usuarioDecodificado = jwt.verify(token, JWT_SECRET);
        req.usuario = usuarioDecodificado;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// 2. MIDDLEWARE ESPECÍFICO: Validar que el usuario sea ADMINISTRADOR
const esAdmin = (req, res, next) => {
    if (!req.usuario || !req.usuario.role) {
        return res.status(403).json({ message: 'Acceso restringido: Rol no identificado' });
    }
    
    const rolUsuario = req.usuario.role.toUpperCase();
    if (rolUsuario !== 'ADMIN') {
        return res.status(403).json({ message: 'Acceso restringido: Se requieren permisos de Administrador' });
    }
    next();
};

// 3. MIDDLEWARE ESPECÍFICO: Validar que el usuario sea CLIENTE
const esCliente = (req, res, next) => {
    if (!req.usuario || !req.usuario.role) {
        return res.status(403).json({ message: 'Acceso restringido: Rol no identificado' });
    }
    
    const rolUsuario = req.usuario.role.toUpperCase();
    if (rolUsuario !== 'CLIENTE') {
        return res.status(403).json({ message: 'Acceso restringido: Se requieren permisos de Cliente' });
    }
    next();
};

module.exports = {
    verificarToken,
    esAdmin,
    esCliente
};