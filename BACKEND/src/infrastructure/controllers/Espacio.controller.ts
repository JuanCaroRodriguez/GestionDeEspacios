import { Request, Response } from "express";
import { EspacioRepository } from "../repositories/Espacio.repository";

export class EspacioController {
  private espacioRepository: EspacioRepository;

  constructor() {
    this.espacioRepository = new EspacioRepository();
  }

  // GET - Obtener todos los espacios
  async getAll(req: Request, res: Response) {
    try {
      const espacios = await this.espacioRepository.findAll();
      res.json(espacios);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener espacios" });
    }
  }

  // GET - Obtener espacio por ID
  async getById(req: Request, res: Response) {
    try {
      const espacio = await this.espacioRepository.findById(req.params.id);
      if (!espacio) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }
      res.json(espacio);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener espacio" });
    }
  }

  // POST - Crear nuevo espacio
  async create(req: Request, res: Response) {
    try {
      const { id, nombre, tipo, capacidad, ubicacion } = req.body;

      if (!id || !nombre || !tipo || !capacidad || !ubicacion) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const existsById = await this.espacioRepository.existsById(id);
      if (existsById) {
        return res.status(400).json({ error: "El ID ya está registrado" });
      }

      // Crear espacio usando SuperAdmin
      const { SuperAdmin } = await import("../../domain/SuperAdmin");
      const superAdmin = new SuperAdmin("temp", "temp", "temp", "temp");
      const espacio = superAdmin.crearEspacio(
        id,
        nombre,
        tipo,
        capacidad,
        ubicacion,
      );

      const createdEspacio = await this.espacioRepository.create(espacio);
      res.status(201).json(createdEspacio);
    } catch (error) {
      res.status(500).json({ error: "Error al crear espacio" });
    }
  }

  // PUT - Actualizar espacio
  async update(req: Request, res: Response) {
    try {
      const { nombre, tipo, capacidad, ubicacion } = req.body;

      const espacio = await this.espacioRepository.findById(req.params.id);
      if (!espacio) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }

      // Preparar datos de actualización
      const updateData: any = {};
      
      // Agregar campos si se proporcionan
      if (nombre) updateData.nombre = nombre;
      if (tipo) updateData.tipo = tipo;
      if (capacidad) updateData.capacidad = capacidad;
      if (ubicacion) updateData.ubicacion = ubicacion;

      const updatedEspacio = await this.espacioRepository.update(
        req.params.id,
        updateData,
      );
      res.json(updatedEspacio);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar espacio" });
    }
  }

  // DELETE - Eliminar espacio
  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.espacioRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar espacio" });
    }
  }

  // PATCH - Cambiar disponibilidad de espacio
  async toggleDisponibilidad(req: Request, res: Response) {
    try {
      const espacio = await this.espacioRepository.findById(req.params.id);
      if (!espacio) {
        return res.status(404).json({ error: "Espacio no encontrado" });
      }

      // Cambiar disponibilidad usando updateData
      const nuevaDisponibilidad = !espacio.getDisponible();
      const updateData: any = { disponible: nuevaDisponibilidad };

      const updatedEspacio = await this.espacioRepository.update(
        req.params.id,
        updateData,
      );
      res.json(updatedEspacio);
    } catch (error) {
      res.status(500).json({ error: "Error al cambiar disponibilidad del espacio" });
    }
  }
}
