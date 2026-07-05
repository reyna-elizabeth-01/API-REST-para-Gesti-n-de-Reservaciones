const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// Inicialización de Prisma y Express
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// ====== RUTAS DEL SISTEMA ======
const authRoutes = require('./routes/auth.routes');
const mesaRoutes = require('./routes/mesa.routes');
const reservacionRoutes = require('./routes/reservacion.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/mesas', mesaRoutes);
app.use('/api/v1/reservaciones', reservacionRoutes);

// Ruta base de comprobación
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Bienvenidos a la API de Restaurante',
        descripcion: 'API que gestiona mesas y reservaciones en base al rol del usuario',
        version: '1.0.0'
    });
});

// Inicializar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});