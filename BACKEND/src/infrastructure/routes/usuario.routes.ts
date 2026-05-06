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
