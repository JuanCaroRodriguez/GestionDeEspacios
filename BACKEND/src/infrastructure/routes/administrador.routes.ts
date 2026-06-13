import { Router } from "express";
import { AdministradorController } from "../controllers/Administrador.controller";

const router = Router();
const administradorController = new AdministradorController();

// GET - Obtener todos los administradores
router.get("/", (req, res) => administradorController.getAll(req, res));

// GET - Obtener administradores por empresa (más específico primero)
router.get("/empresa/:idEmpresa", (req, res) =>
  administradorController.getByEmpresa(req, res),
);

// PUT - Actualizar estado de administrador
router.put("/:id/estado", (req, res) =>
  administradorController.updateEstado(req, res),
);

// GET - Obtener administrador por ID
router.get("/:id", (req, res) => administradorController.getById(req, res));

// POST - Crear administrador
router.post("/", async (req, res) => {
  try {
    const { id, nombre, email, contraseña, permisos, estado, id_empresa } =
      req.body;

    // Validaciones básicas
    if (!id || !nombre || !email || !contraseña || !id_empresa) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar estado
    if (!["activo", "inactivo", "suspendido"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    // Verificar si el email ya existe
    const { AdministradorRepository } =
      await import("../repositories/Administrador.repository");
    const administradorRepository = new AdministradorRepository();
    const administradorExistente =
      await administradorRepository.findByEmail(email);
    if (administradorExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear contraseña
    const bcrypt = await import("bcryptjs");
    const contraseñaHasheada = await bcrypt.hash(contraseña, 8);

    // Crear administrador directamente con el modelo
    const { AdministradorModel } =
      await import("../models/Administrador.model");
    const nuevoAdministrador = new AdministradorModel({
      id,
      nombre,
      email,
      contraseña: contraseñaHasheada,
      permisos: permisos || ["evaluar_reservas_laboratorios"],
      estado: estado || "activo",
      id_empresa,
    });

    // Guardar en la base de datos
    const administradorGuardado = await nuevoAdministrador.save();

    // Crear respuesta sin contraseña
    const administradorSinContraseña = {
      id: administradorGuardado.id,
      nombre: administradorGuardado.nombre,
      email: administradorGuardado.email,
      permisos: administradorGuardado.permisos,
      estado: administradorGuardado.estado,
      id_empresa: administradorGuardado.id_empresa,
    };

    res.status(201).json(administradorSinContraseña);
  } catch (error) {
    console.error("Error al crear administrador:", error);
    res.status(500).json({ error: "Error al crear administrador" });
  }
});

// POST - Evaluar solicitud de reserva de laboratorio
router.post("/evaluar-reserva-laboratorio", (req, res) =>
  administradorController.evaluarReservaLaboratorio(req, res),
);

// PUT - Actualizar administrador
router.put("/:id", (req, res) => administradorController.update(req, res));

// DELETE - Eliminar administrador
router.delete("/:id", (req, res) => administradorController.delete(req, res));

export default router;
