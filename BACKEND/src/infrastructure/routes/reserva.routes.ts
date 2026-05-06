import { Router } from 'express';
import { ReservaRepository } from '../repositories/Reserva.repository';

const router = Router();
const reservaRepository = new ReservaRepository();

// GET - Obtener todas las reservas
router.get('/', async (req, res) => {
    try {
        const reservas = await reservaRepository.findAll();
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
});

// GET - Obtener reserva por ID
router.get('/:id', async (req, res) => {
    try {
        const reserva = await reservaRepository.findById(req.params.id);
        if (!reserva) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reserva' });
    }
});

// GET - Obtener reservas por persona
router.get('/persona/:personaId', async (req, res) => {
    try {
        const reservas = await reservaRepository.findByPersonaId(req.params.personaId);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas de la persona' });
    }
});

// GET - Obtener reservas por espacio
router.get('/espacio/:espacioId', async (req, res) => {
    try {
        const reservas = await reservaRepository.findByEspacioId(req.params.espacioId);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas del espacio' });
    }
});

// GET - Obtener reservas por estado
router.get('/estado/:estado', async (req, res) => {
    try {
        const reservas = await reservaRepository.findByEstado(req.params.estado);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas por estado' });
    }
});

// GET - Obtener reservas activas
router.get('/activas', async (req, res) => {
    try {
        const reservas = await reservaRepository.findActiveReservas();
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas activas' });
    }
});

// GET - Obtener reservas en rango de fechas
router.get('/fechas', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
        }

        const inicio = new Date(fechaInicio as string);
        const fin = new Date(fechaFin as string);

        const reservas = await reservaRepository.findByDateRange(inicio, fin);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas en rango de fechas' });
    }
});

// GET - Obtener reservas de espacio en rango de fechas
router.get('/espacio/:espacioId/fechas', async (req, res) => {
    try {
        const { espacioId } = req.params;
        const { fechaInicio, fechaFin } = req.query;
        
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
        }

        const inicio = new Date(fechaInicio as string);
        const fin = new Date(fechaFin as string);

        const reservas = await reservaRepository.findReservasByEspacioAndDateRange(espacioId, inicio, fin);
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas del espacio en rango de fechas' });
    }
});

// POST - Crear reserva
router.post('/', async (req, res) => {
    try {
        const { id, personaId, espacioId, fechaInicio, fechaFin, motivo } = req.body;
        
        // Validaciones
        if (!id || !personaId || !espacioId || !fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Verificar si ya existe
        const existsById = await reservaRepository.existsById(id);
        if (existsById) {
            return res.status(400).json({ error: 'El ID de reserva ya está registrado' });
        }

        // Verificar que las fechas sean válidas
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (inicio >= fin) {
            return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de fin' });
        }

        // Obtener la persona
        const { Usuario } = await import('../../domain/Usuario');
        const usuario = new Usuario(personaId, '', '', '', 'estudiante'); // Temporal, se debe obtener de la BD
        
        // Crear reserva
        const { Reserva } = await import('../../domain/Reserva');
        const reserva = new Reserva(id, usuario, espacioId, inicio, fin);
        
        const createdReserva = await reservaRepository.create(reserva);
        res.status(201).json(createdReserva);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear reserva' });
    }
});

// PUT - Cancelar reserva
router.put('/:id/cancelar', async (req, res) => {
    try {
        const cancelled = await reservaRepository.cancelReserva(req.params.id);
        if (!cancelled) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.json({ message: 'Reserva cancelada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar reserva' });
    }
});

// DELETE - Eliminar reserva
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await reservaRepository.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar reserva' });
    }
});

export default router;
