import { Router } from "express";
import bcrypt from "bcryptjs";
import { UsuarioRepository } from "../repositories/Usuario.repository";
import { SuperAdminRepository } from "../repositories/SuperAdmin.repository";
import { AdministradorRepository } from "../repositories/Administrador.repository";

const router = Router();
const usuarioRepository = new UsuarioRepository();
const superAdminRepository = new SuperAdminRepository();
const administradorRepository = new AdministradorRepository();

// POST - Login unificado
router.post("/login", async (req, res) => {
  try {
    const { email, contraseña, tipo } = req.body;

    console.log("Login attempt:", { email, tipo }); // Debug

    // Validaciones
    if (!email || !contraseña || !tipo) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
        required: ["email", "contraseña", "tipo"],
      });
    }

    // Validar tipo
    const tiposValidos = ["superadmin", "administrador", "usuario"];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        error: "Tipo de usuario no válido",
        validTypes: tiposValidos,
      });
    }

    let user = null;
    let userData = null;

    // Buscar en la colección correspondiente según el tipo
    switch (tipo) {
      case "superadmin":
        user = await superAdminRepository.findByEmail(email);
        if (user) {
          userData = {
            id: user.getId(),
            nombre: user.getNombre(),
            email: user.getEmail(),
            tipo: "superadmin",
            permisos: [
              "crear_espacios",
              "eliminar_espacios",
              "modificar_espacios",
              "crear_usuarios",
              "eliminar_usuarios",
              "modificar_usuarios",
              "suspender_usuarios",
            ],
          };
        }
        break;

      case "administrador":
        user = await administradorRepository.findByEmail(email);
        if (user) {
          userData = {
            id: user.getId(),
            nombre: user.getNombre(),
            email: user.getEmail(),
            tipo: "administrador",
            permisos: ["evaluar_reservas_laboratorios"],
          };
        }
        break;

      case "usuario":
        user = await usuarioRepository.findByEmail(email);
        if (user) {
          userData = {
            id: user.getId(),
            nombre: user.getNombre(),
            email: user.getEmail(),
            tipo: (user as any).getTipo(), // 'estudiante' o 'docente'
            permisos: [
              "reservar_espacios",
              "consultar_disponibilidad",
              "cancelar_reservas",
            ],
          };
        }
        break;
    }

    // Verificar si se encontró el usuario
    if (!user) {
      console.log("User not found for:", { email, tipo }); // Debug
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "El email no está registrado para este tipo de usuario",
      });
    }

    console.log("User found:", user.getId()); // Debug

    // Verificar contraseña usando bcrypt
    const isPasswordValid = await bcrypt.compare(
      contraseña,
      user.getContraseña(),
    );
    if (!isPasswordValid) {
      console.log("Password mismatch for:", email); // Debug
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "La contraseña es incorrecta",
      });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      message: "Login exitoso",
      user: userData,
      token: `mock-jwt-token-${user.getId()}`, // En producción, usar JWT real
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET - Obtener información del usuario autenticado
router.get("/profile/:tipo/:email", async (req, res) => {
  try {
    const { tipo, email } = req.params;

    let user = null;
    let userData = null;

    switch (tipo) {
      case "superadmin":
        user = await superAdminRepository.findByEmail(email);
        break;
      case "administrador":
        user = await administradorRepository.findByEmail(email);
        break;
      case "usuario":
        user = await usuarioRepository.findByEmail(email);
        break;
    }

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Construir respuesta según tipo
    switch (tipo) {
      case "superadmin":
        userData = {
          id: user.getId(),
          nombre: user.getNombre(),
          email: user.getEmail(),
          tipo: "superadmin",
          permisos: [
            "crear_espacios",
            "eliminar_espacios",
            "modificar_espacios",
            "crear_usuarios",
            "eliminar_usuarios",
            "modificar_usuarios",
            "suspender_usuarios",
          ],
        };
        break;

      case "administrador":
        userData = {
          id: user.getId(),
          nombre: user.getNombre(),
          email: user.getEmail(),
          tipo: "administrador",
          permisos: ["evaluar_reservas_laboratorios"],
        };
        break;

      case "usuario":
        userData = {
          id: user.getId(),
          nombre: user.getNombre(),
          email: user.getEmail(),
          tipo: (user as any).getTipo(),
          permisos: [
            "reservar_espacios",
            "consultar_disponibilidad",
            "cancelar_reservas",
          ],
        };
        break;
    }

    res.json(userData);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
