import { Router } from 'express';
import { EmpresaRepository } from '../repositories/Empresa.repository';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const empresaRepository = new EmpresaRepository();

// POST /api/empresas - Crear empresa
router.post('/', async (req, res) => {
    try {
        const { nombre, nit } = req.body;
        
        // Validaciones
        if (!nombre || !nit) {
            return res.status(400).json({ error: 'El nombre y NIT son obligatorios' });
        }

        // Verificar si ya existe una empresa con ese NIT
        const existsByNit = await empresaRepository.existsByNit(nit);
        if (existsByNit) {
            return res.status(400).json({ error: 'El NIT ya está registrado' });
        }

        // Generar ID único
        const id = `EMP-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Crear empresa
        const { Empresa } = await import('../../domain/Empresa');
        const empresa = new Empresa(id, nombre.trim(), nit.trim());
        
        const createdEmpresa = await empresaRepository.create(empresa);
        res.status(201).json(createdEmpresa);
    } catch (error) {
        console.error('Error al crear empresa:', error);
        res.status(500).json({ error: 'Error al crear empresa' });
    }
});

// GET /api/empresas - Obtener todas las empresas
router.get('/', async (req, res) => {
    try {
        const empresas = await empresaRepository.findAll();
        res.json(empresas);
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        res.status(500).json({ error: 'Error al obtener empresas' });
    }
});

// GET /api/empresas/:id - Obtener empresa por ID
router.get('/:id', async (req, res) => {
    try {
        const empresa = await empresaRepository.findById(req.params.id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        res.json(empresa);
    } catch (error) {
        console.error('Error al obtener empresa:', error);
        res.status(500).json({ error: 'Error al obtener empresa' });
    }
});

// GET /api/empresas/nit/:nit - Obtener empresa por NIT
router.get('/nit/:nit', async (req, res) => {
    try {
        const empresa = await empresaRepository.findByNit(req.params.nit);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }
        res.json(empresa);
    } catch (error) {
        console.error('Error al obtener empresa por NIT:', error);
        res.status(500).json({ error: 'Error al obtener empresa' });
    }
});

// PUT /api/empresas/:id - Actualizar empresa
router.put('/:id', async (req, res) => {
    try {
        const { nombre, nit } = req.body;
        
        if (!nombre && !nit) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
        }

        // Si se va a actualizar el NIT, verificar que no exista
        if (nit) {
            const existingEmpresa = await empresaRepository.findByNit(nit);
            if (existingEmpresa && existingEmpresa.getId() !== req.params.id) {
                return res.status(400).json({ error: 'El NIT ya está registrado por otra empresa' });
            }
        }

        const empresa = await empresaRepository.findById(req.params.id);
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        // Actualizar campos
        if (nombre) empresa.setNombre(nombre.trim());
        if (nit) empresa.setNit(nit.trim());

        const updatedEmpresa = await empresaRepository.update(req.params.id, empresa);
        res.json(updatedEmpresa);
    } catch (error) {
        console.error('Error al actualizar empresa:', error);
        res.status(500).json({ error: 'Error al actualizar empresa' });
    }
});

// DELETE /api/empresas/:id - Eliminar empresa
router.delete('/:id', async (req, res) => {
    try {
        const exists = await empresaRepository.existsById(req.params.id);
        if (!exists) {
            return res.status(404).json({ error: 'Empresa no encontrada' });
        }

        const deleted = await empresaRepository.delete(req.params.id);
        if (deleted) {
            res.json({ message: 'Empresa eliminada correctamente' });
        } else {
            res.status(500).json({ error: 'No se pudo eliminar la empresa' });
        }
    } catch (error) {
        console.error('Error al eliminar empresa:', error);
        res.status(500).json({ error: 'Error al eliminar empresa' });
    }
});

export default router;
