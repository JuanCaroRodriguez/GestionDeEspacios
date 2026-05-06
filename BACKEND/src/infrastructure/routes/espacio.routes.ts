import { Router } from 'express';
import { EspacioRepository } from '../repositories/Espacio.repository';

const router = Router();
const espacioRepository = new EspacioRepository();

// GET - Obtener todos los espacios
router.get('/', async (req, res) => {
    try {
        const espacios = await espacioRepository.findAll();
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacios' });
    }
});

// GET - Obtener espacio por ID
router.get('/:id', async (req, res) => {
    try {
        const espacio = await espacioRepository.findById(req.params.id);
        if (!espacio) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }
        res.json(espacio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacio' });
    }
});

// GET - Obtener espacios disponibles
router.get('/disponibles/:disponible', async (req, res) => {
    try {
        const disponible = req.params.disponible === 'true';
        const espacios = await espacioRepository.findByDisponible(disponible);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacios disponibles' });
    }
});

// GET - Obtener espacios por tipo
router.get('/tipo/:tipo', async (req, res) => {
    try {
        const espacios = await espacioRepository.findByTipo(req.params.tipo);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacios por tipo' });
    }
});

// GET - Obtener espacios por ubicación
router.get('/ubicacion/:ubicacion', async (req, res) => {
    try {
        const espacios = await espacioRepository.findByUbicacion(req.params.ubicacion);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacios por ubicación' });
    }
});

// GET - Obtener espacios disponibles en rango de fechas
router.get('/disponibles/fechas', async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ error: 'Se requieren fechaInicio y fechaFin' });
        }

        const inicio = new Date(fechaInicio as string);
        const fin = new Date(fechaFin as string);

        const espacios = await espacioRepository.findAvailableByDateRange(inicio, fin);
        res.json(espacios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener espacios disponibles en rango de fechas' });
    }
});

// POST - Crear espacio
router.post('/', async (req, res) => {
    try {
        const { id, nombre, tipo, capacidad, ubicacion } = req.body;
        
        // Validaciones
        if (!id || !nombre || !tipo || !capacidad || !ubicacion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Verificar si ya existe
        const existsById = await espacioRepository.existsById(id);
        if (existsById) {
            return res.status(400).json({ error: 'El ID ya está registrado' });
        }

        // Crear espacio
        const { Espacio } = await import('../../domain/Espacio');
        const espacio = new Espacio(id, nombre, tipo, capacidad, ubicacion);
        
        const createdEspacio = await espacioRepository.create(espacio);
        res.status(201).json(createdEspacio);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear espacio' });
    }
});

// PUT - Actualizar espacio
router.put('/:id', async (req, res) => {
    try {
        const { nombre, tipo, capacidad, ubicacion, disponible } = req.body;
        
        const espacio = await espacioRepository.findById(req.params.id);
        if (!espacio) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }

        // Actualizar propiedades
        if (nombre) espacio.setNombre(nombre);
        if (tipo) espacio.setTipo(tipo);
        if (capacidad) espacio.setCapacidad(capacidad);
        if (ubicacion) espacio.setUbicacion(ubicacion);
        if (disponible !== undefined) espacio.setDisponible(disponible);

        const updatedEspacio = await espacioRepository.update(req.params.id, espacio);
        res.json(updatedEspacio);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar espacio' });
    }
});

// DELETE - Eliminar espacio
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await espacioRepository.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar espacio' });
    }
});

export default router;
