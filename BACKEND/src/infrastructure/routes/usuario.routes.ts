import { Router } from "express";
import { UsuarioRepository } from "../repositories/Usuario.repository";

const router = Router();
const usuarioRepository = new UsuarioRepository();

// GET - Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await usuarioRepository.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET - Obtener usuario por email
router.get("/email/:email", async (req, res) => {
  try {
    const usuario = await usuarioRepository.findByEmail(req.params.email);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario por email" });
  }
});

// GET - Obtener usuarios por tipo
router.get("/tipo/:tipo", async (req, res) => {
  try {
    const { tipo } = req.params;
    if (tipo !== "estudiante" && tipo !== "docente") {
      return res.status(400).json({ error: "Tipo de usuario no válido" });
    }
    const usuarios = await usuarioRepository.findByTipo(
      tipo as "estudiante" | "docente",
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios por tipo" });
  }
});

// GET - Obtener usuarios por empresa
router.get("/empresa/:idEmpresa", async (req, res) => {
  try {
    const { idEmpresa } = req.params;
    const usuarios = await usuarioRepository.findByEmpresa(idEmpresa);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios por empresa" });
  }
});

// GET - Obtener usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const usuario = await usuarioRepository.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// PUT - Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { nombre, email, contraseña, tipo } = req.body;

    const usuario = await usuarioRepository.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Preparar datos de actualización
    const updateData: any = {};

    // Agregar campos si se proporcionan
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email;
    if (tipo) updateData.tipo = tipo;

    // Hashear contraseña si se proporciona
    if (contraseña) {
      const bcrypt = await import("bcryptjs");
      const contraseñaHasheada = await bcrypt.hash(contraseña, 8);
      updateData.contraseña = contraseñaHasheada;
    }

    const updatedUsuario = await usuarioRepository.update(
      req.params.id,
      updateData,
    );
    res.json(updatedUsuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// POST - Crear usuario
router.post("/", async (req, res) => {
  try {
    const { id, nombre, email, contraseña, tipo, estado, id_empresa } =
      req.body;

    // Validaciones básicas
    if (!id || !nombre || !email || !contraseña || !tipo || !id_empresa) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar tipo
    if (!["estudiante", "docente"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo de usuario no válido" });
    }

    // Validar estado
    if (!["activo", "inactivo", "suspendido"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Hashear contraseña
    const bcrypt = await import("bcryptjs");
    const contraseñaHasheada = await bcrypt.hash(contraseña, 8);

    // Crear usuario directamente con el modelo
    const { UsuarioModel } = await import("../models/Usuario.model");
    const nuevoUsuario = new UsuarioModel({
      id,
      nombre,
      email,
      contraseña: contraseñaHasheada,
      tipo,
      estado: estado || "activo",
      id_empresa,
    });

    // Guardar en la base de datos
    const usuarioGuardado = await nuevoUsuario.save();

    // Crear respuesta sin contraseña
    const usuarioSinContraseña = {
      id: usuarioGuardado.id,
      nombre: usuarioGuardado.nombre,
      email: usuarioGuardado.email,
      tipo: usuarioGuardado.tipo,
      estado: usuarioGuardado.estado,
      id_empresa: usuarioGuardado.id_empresa,
    };

    res.status(201).json(usuarioSinContraseña);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT - Actualizar estado de usuario
router.put("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !["activo", "inactivo", "suspendido"].includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    const updatedUsuario = await usuarioRepository.updateEstado(id, estado);
    if (!updatedUsuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(updatedUsuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar estado del usuario" });
  }
});

// DELETE - Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await usuarioRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

export default router;
