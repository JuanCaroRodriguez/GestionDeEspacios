import { Request, Response } from "express";
import { AdministradorRepository } from "../repositories/Administrador.repository";

export class AdministradorController {
  private administradorRepository: AdministradorRepository;

  constructor() {
    this.administradorRepository = new AdministradorRepository();
  }

  // GET - Obtener todos los administradores
  async getAll(req: Request, res: Response) {
    try {
      const administradores = await this.administradorRepository.findAll();
      res.json(administradores);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener administradores" });
    }
  }

  // GET - Obtener administrador por ID
  async getById(req: Request, res: Response) {
    try {
      const administrador = await this.administradorRepository.findById(req.params.id);
      if (!administrador) {
        return res.status(404).json({ error: "Administrador no encontrado" });
      }
      res.json(administrador);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener administrador" });
    }
  }

  // POST - Crear nuevo administrador
  async create(req: Request, res: Response) {
    try {
      const { id, nombre, email, contraseña } = req.body;

      if (!id || !nombre || !email || !contraseña) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      // Verificar si ya existe
      const existsByEmail = await this.administradorRepository.existsByEmail(email);
      if (existsByEmail) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }

      const existsById = await this.administradorRepository.existsById(id);
      if (existsById) {
        return res.status(400).json({ error: "El ID ya está registrado" });
      }

      // Hashear la contraseña antes de crear el administrador
      const bcrypt = await import("bcryptjs");
      const contraseñaHasheada = await bcrypt.hash(contraseña, 8);

      // Crear administrador con contraseña hasheada
      const { Administrador } = await import("../../domain/Administrador");
      const administrador = new Administrador(id, nombre, email, contraseñaHasheada);

      const createdAdministrador = await this.administradorRepository.create(administrador);
      res.status(201).json(createdAdministrador);
    } catch (error) {
      res.status(500).json({ error: "Error al crear administrador" });
    }
  }

  // PUT - Actualizar administrador
  async update(req: Request, res: Response) {
    try {
      const { nombre, email, contraseña } = req.body;

      const administrador = await this.administradorRepository.findById(req.params.id);
      if (!administrador) {
        return res.status(404).json({ error: "Administrador no encontrado" });
      }

      // Preparar datos de actualización
      const updateData: any = {};
      
      // Agregar campos si se proporcionan
      if (nombre) updateData.nombre = nombre;
      if (email) updateData.email = email;
      
      // Hashear contraseña si se proporciona
      if (contraseña) {
        const bcrypt = await import("bcryptjs");
        const contraseñaHasheada = await bcrypt.hash(contraseña, 8);
        updateData.contraseña = contraseñaHasheada;
      }

      const updatedAdministrador = await this.administradorRepository.update(
        req.params.id,
        updateData,
      );
      res.json(updatedAdministrador);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar administrador" });
    }
  }

  // DELETE - Eliminar administrador
  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.administradorRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Administrador no encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar administrador" });
    }
  }

  // POST - Evaluar solicitud de reserva de laboratorio
  async evaluarReservaLaboratorio(req: Request, res: Response) {
    try {
      const { reservaId, solicitante, espacio, motivo } = req.body;

      if (!reservaId || !solicitante || !espacio || !motivo) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const { Administrador } = await import("../../domain/Administrador");
      const administrador = new Administrador("temp", "temp", "temp", "temp");
      const resultado = administrador.evaluarSolicitudReservaLaboratorio(
        reservaId,
        solicitante,
        espacio,
        motivo,
      );

      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: "Error al evaluar solicitud de reserva" });
    }
  }
}
