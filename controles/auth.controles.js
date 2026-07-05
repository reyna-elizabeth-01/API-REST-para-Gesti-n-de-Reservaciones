const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// 1. REGISTRO DE NUEVO USUARIO (Modificado para aceptar rol personalizado)
const registrarUsuario = async (req, res) => {
    try {
        // Añadimos 'rol' a la desestructuración del cuerpo de la petición
        const { nombre, correo, password, rol } = req.body; 

        const existeUsuario = await prisma.usuario.findUnique({
            where: { correo } 
        });

        if (existeUsuario) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                correo, 
                password: hashedPassword,
                // Si mandas un rol en el JSON, lo usa (pasándolo a minúsculas por compatibilidad),
                // si no mandas nada, se queda con 'cliente' por defecto.
                rol: rol ? rol.toLowerCase() : 'cliente' 
            }
        });

        nuevoUsuario.password = undefined;
        res.status(201).json({ message: 'Usuario registrado con éxito', usuario: nuevoUsuario });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
    }
};

// 2. LOGIN
const loginUsuario = async (req, res) => {
    try {
        const { correo, password } = req.body; 

        const usuario = await prisma.usuario.findUnique({
            where: { correo } 
        });

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales incorrectas (correo no encontrado)' });
        }

        const passwordCorrecto = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecto) {
            return res.status(401).json({ message: 'Credenciales incorrectas (contraseña inválida)' });
        }

        // Generamos el token guardando 'rol' en lugar de 'role'
        const token = jwt.sign(
            { id: usuario.id, correo: usuario.correo, role: usuario.rol }, 
            JWT_SECRET,
            { expiresIn: '4h' }
        );

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
};

// 3. OBTENER PERFIL
const obtenerPerfil = async (req, res) => {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: req.usuario.id }
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        usuario.password = undefined;
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el perfil', error: error.message });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario,
    obtenerPerfil
};