const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. CREAR UNA RESERVACIÓN (Solo Clientes)
const crearReservacion = async (req, res) => {
    // Declaramos las variables arriba para que estén disponibles en todo el bloque
    let fechaFormateada, horaFormateada, mesaId, personas, usuarioId;
    
    try {
        const { fecha, hora } = req.body;
        personas = req.body.personas;
        mesaId = req.body.mesaId;
        usuarioId = req.usuario.id; 

        fechaFormateada = new Date(fecha);
        horaFormateada = new Date(hora);

        // REGLA DE ORO: Validar si la mesa ya tiene una reserva exacta en esa fecha y hora
        const reservaExistente = await prisma.reservacion.findFirst({
            where: {
                mesaId: Number(mesaId),
                fecha: fechaFormateada,
                hora: horaFormateada
            }
        });

        if (reservaExistente) {
            return res.status(400).json({ 
                message: 'La mesa seleccionada ya se encuentra ocupada en esa fecha y bloque de hora.' 
            });
        }
    } catch (errValidacion) {
        return res.status(400).json({ message: 'Error en el formato de los datos enviados', error: errValidacion.message });
    }

    // Bloque independiente de inserción: Probamos primero el String directo 'PENDIENTE'
    try {
        const nuevaReserva = await prisma.reservacion.create({
            data: {
                fecha: fechaFormateada,
                hora: horaFormateada,
                personas: Number(personas),
                mesaId: Number(mesaId),       
                usuarioId: Number(usuarioId), 
                estado: 'PENDIENTE' // Forzar mayúscula
            }
        });
        return res.status(201).json({ message: 'Reservación creada con éxito', reservacion: nuevaReserva });
    } catch (errorMayuscula) {
        // Si PostgreSQL se queja del Enum en mayúsculas, intentamos de inmediato en minúsculas
        try {
            const nuevaReservaMin = await prisma.reservacion.create({
                data: {
                    fecha: fechaFormateada,
                    hora: horaFormateada,
                    personas: Number(personas),
                    mesaId: Number(mesaId),       
                    usuarioId: Number(usuarioId), 
                    estado: 'pendiente' // Forzar minúscula
                }
            });
            return res.status(201).json({ message: 'Reservación creada con éxito', reservacion: nuevaReservaMin });
        } catch (errorFinal) {
            // Si todo lo anterior falla, la api NO se queda colgada; te dice exactamente qué le duele a la DB
            return res.status(500).json({ message: 'Error crítico en la base de datos al insertar', error: errorFinal.message });
        }
    }
};

// 2. VER MIS RESERVACIONES (Solo Clientes)
const obtenerMisReservaciones = async (req, res) => {
    try {
        const misReservas = await prisma.reservacion.findMany({
            where: { usuarioId: Number(req.usuario.id) }
        });
        return res.status(200).json(misReservas);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener tus reservaciones', error: error.message });
    }
};

// 3. VER TODAS LAS RESERVACIONES (Solo Admins)
const obtenerTodasReservaciones = async (req, res) => {
    try {
        const todasReservas = await prisma.reservacion.findMany();
        return res.status(200).json(todasReservas);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener todas las reservaciones', error: error.message });
    }
};

// 4. CAMBIAR ESTADO DE RESERVACIÓN (Solo Admins)
const cambiarEstadoReservacion = async (req, res) => {
    try {
        const idReserva = Number(req.params.id);
        const { estado } = req.body;
        const reservaActualizada = await prisma.reservacion.update({
            where: { id: idReserva },
            data: { estado: estado }
        });
        return res.status(200).json({ message: `Reservación actualizada`, reservacion: reservaActualizada });
    } catch (error) {
        return res.status(500).json({ message: 'Error al cambiar el estado', error: error.message });
    }
};

// 5. CANCELAR PROPIA RESERVACIÓN (Solo Clientes)
const cancelarPropiaReservacion = async (req, res) => {
    try {
        const idReserva = Number(req.params.id);
        const reservaCancelada = await prisma.reservacion.update({
            where: { id: idReserva },
            data: { estado: 'CANCELADA' }
        });
        return res.status(200).json({ message: 'Reservación cancelada', reservacion: reservaCancelada });
    } catch (error) {
        return res.status(500).json({ message: 'Error al cancelar la reservación', error: error.message });
    }
};

module.exports = {
    crearReservacion,
    obtenerMisReservaciones,
    obtenerTodasReservaciones,
    cambiarEstadoReservacion,
    cancelarPropiaReservacion
};