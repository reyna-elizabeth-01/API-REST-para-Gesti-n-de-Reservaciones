const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Método para obtener todas las mesas activas
const obtenerMesas = async (req, res) => {
    try {
        const listaMesas = await prisma.mesa.findMany({
            where: { disponible: true }
        });
        res.status(200).json(listaMesas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las mesas', error: error.message });
    }
};

// 2. Función para obtener mesa por su ID
const obtenerMesaById = async (req, res) => {
    try {
        const idmesa = Number(req.params.id);
        const mesa = await prisma.mesa.findUnique({
            where: { id: idmesa },
        });

        if (!mesa || !mesa.disponible) {
            return res.status(404).json({ message: 'Mesa no encontrada o inactiva' });
        }

        res.status(200).json(mesa);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar la mesa', error: error.message });
    }
};

// 3. Función para crear una nueva mesa
const crearMesa = async (req, res) => {
    try {
        const { numero, capacidad, disponible } = req.body;
        
        const nuevaMesa = await prisma.mesa.create({
            data: {
                numero: Number(numero),
                capacidad: Number(capacidad),
                disponible: disponible !== undefined ? disponible : true
            }
        });
        
        res.status(201).json({ message: "Mesa registrada correctamente", mesa: nuevaMesa });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la mesa', error: error.message });
    }
};

// 4. Función para actualizar datos de una mesa
const actualizarMesa = async (req, res) => {
    try {
        const idmesa = Number(req.params.id);
        const { numero, capacidad, disponible } = req.body;

        const existeMesa = await prisma.mesa.findUnique({
            where: { id: idmesa }
        });

        if (!existeMesa) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }

        const mesaActualizada = await prisma.mesa.update({
            where: { id: idmesa },
            data: {
                numero: numero !== undefined ? Number(numero) : existeMesa.numero,
                capacidad: capacidad !== undefined ? Number(capacidad) : existeMesa.capacidad,
                disponible: disponible !== undefined ? disponible : existeMesa.disponible
            }
        });

        res.status(200).json({ message: 'Mesa actualizada con éxito', mesa: mesaActualizada });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la mesa', error: error.message });
    }
};

// 5. Función para desactivar mesa (Soft Delete)
const desactivarMesa = async (req, res) => {
    try {
        const idmesa = Number(req.params.id);

        const existeMesa = await prisma.mesa.findUnique({
            where: { id: idmesa }
        });

        if (!existeMesa) {
            return res.status(404).json({ message: 'Mesa no encontrada' });
        }

        const mesaDesactivada = await prisma.mesa.update({
            where: { id: idmesa },
            data: { disponible: false }
        });

        res.status(200).json({ message: 'Mesa desactivada correctamente (Soft Delete)', mesa: mesaDesactivada });
    } catch (error) {
        res.status(500).json({ message: 'Error al desactivar la mesa', error: error.message });
    }
};

// Exportación de todos los módulos
module.exports = {
    obtenerMesas,
    obtenerMesaById,
    crearMesa,
    actualizarMesa,
    desactivarMesa
};