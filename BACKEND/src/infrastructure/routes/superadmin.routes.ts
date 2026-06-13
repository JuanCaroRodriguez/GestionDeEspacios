import { Router } from "express";
import { SuperAdminRepository } from "../repositories/SuperAdmin.repository";
import { UsuarioRepository } from "../repositories/Usuario.repository";
import { EspacioRepository } from "../repositories/Espacio.repository";

const router = Router();
const superAdminRepository = new SuperAdminRepository();
const usuarioRepository = new UsuarioRepository();
const espacioRepository = new EspacioRepository();

// GET - Obtener todos los super admins
router.get("/", async (req, res) => {
  try {
    const superAdmins = await superAdminRepository.findAll();
    res.json(superAdmins);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener super admins" });
  }
});

// GET - Obtener super admin por ID
router.get("/:id", async (req, res) => {
  try {
    const superAdmin = await superAdminRepository.findById(req.params.id);
    if (!superAdmin) {
      return res.status(404).json({ error: "Super admin no encontrado" });
    }
    res.json(superAdmin);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener super admin" });
  }
});

// PUT - Actualizar super admin
router.put("/:id", async (req, res) => {
  try {
    const { id_empresa } = req.body;

    const superAdmin = await superAdminRepository.findById(req.params.id);
    if (!superAdmin) {
      return res.status(404).json({ error: "Super admin no encontrado" });
    }

    // Preparar datos de actualización
    const updateData: any = {};

    // Agregar id_empresa si se proporciona
    if (id_empresa !== undefined) {
      updateData.id_empresa = id_empresa;
    }

    // Actualizar el superadmin
    const updatedSuperAdmin = await superAdminRepository.update(
      req.params.id,
      updateData,
    );
    res.json(updatedSuperAdmin);
  } catch (error) {
    console.error("Error al actualizar superadmin:", error);
    res.status(500).json({ error: "Error al actualizar super admin" });
  }
});

// GET - Obtener administrador por email
router.get("/administradores/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { AdministradorRepository } =
      await import("../repositories/Administrador.repository");
    const administradorRepository = new AdministradorRepository();
    const administrador = await administradorRepository.findByEmail(email);
    if (!administrador) {
      return res.status(404).json({ error: "Administrador no encontrado" });
    }
    res.json(administrador);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener administrador por email" });
  }
});

// GET - Obtener usuario por email
router.get("/usuarios/email/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario por email" });
  }
});

// Rutas para gestión de usuarios
router.post("/usuarios", async (req, res) => {
  try {
    const {
      id,
      nombre,
      email,
      contraseña,
      tipo = "estudiante",
      id_empresa,
    } = req.body;

    if (!id || !nombre || !email || !contraseña || !id_empresa) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar tipo
    if (!["estudiante", "docente"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo de usuario no válido" });
    }

    // Verificar si ya existe
    const existsByEmail = await usuarioRepository.existsByEmail(email);
    if (existsByEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const existsById = await usuarioRepository.existsById(id);
    if (existsById) {
      return res.status(400).json({ error: "El ID ya está registrado" });
    }

    // Hashear la contraseña antes de crear el usuario
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
      estado: "activo",
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

router.delete("/usuarios/:id", async (req, res) => {
  try {
    const deleted = await usuarioRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

router.patch("/usuarios/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    const usuario = await usuarioRepository.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validar estado
    const estadosValidos = ["activo", "inactivo", "suspendido"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: "Estado no válido",
        validos: estadosValidos,
      });
    }

    const updatedUsuario = await usuarioRepository.updateEstado(
      req.params.id,
      estado,
    );
    res.json(updatedUsuario);
  } catch (error) {
    res.status(500).json({ error: "Error al cambiar estado del usuario" });
  }
});

// Rutas para gestión de usuarios (actualización)
router.put("/usuarios/:id", async (req, res) => {
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

    // Actualizar directamente con los datos hasheados
    const updatedUsuario = await usuarioRepository.update(
      req.params.id,
      updateData,
    );
    res.json(updatedUsuario);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Rutas para gestión de administradores
router.post("/administradores", async (req, res) => {
  try {
    const { id, nombre, email, contraseña, id_empresa } = req.body;

    if (!id || !nombre || !email || !contraseña || !id_empresa) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Verificar si ya existe
    const { AdministradorRepository } =
      await import("../repositories/Administrador.repository");
    const administradorRepository = new AdministradorRepository();
    const existsByEmail = await administradorRepository.existsByEmail(email);
    if (existsByEmail) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const existsById = await administradorRepository.existsById(id);
    if (existsById) {
      return res.status(400).json({ error: "El ID ya está registrado" });
    }

    // Hashear la contraseña antes de crear el administrador
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
      permisos: ["evaluar_reservas_laboratorios"],
      estado: "activo",
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
    res.status(500).json({ error: "Error al crear administrador" });
  }
});

// Rutas para gestión de espacios
router.post("/espacios", async (req, res) => {
  try {
    const { id, nombre, tipo, capacidad, bloque, piso, salon, id_empresa } =
      req.body;

    if (
      !id ||
      !nombre ||
      !tipo ||
      !capacidad ||
      !bloque ||
      piso === undefined ||
      !salon ||
      !id_empresa
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const existsById = await espacioRepository.existsById(id);
    if (existsById) {
      return res.status(400).json({ error: "El ID ya está registrado" });
    }

    const { SuperAdmin } = await import("../../domain/SuperAdmin");
    const superAdmin = new SuperAdmin("temp", "temp", "temp", "temp");
    const espacio = superAdmin.crearEspacio(
      id,
      nombre,
      tipo,
      capacidad,
      bloque,
      piso,
      salon,
      id_empresa,
    );

    const createdEspacio = await espacioRepository.create(espacio);
    res.status(201).json(createdEspacio);
  } catch (error) {
    res.status(500).json({ error: "Error al crear espacio" });
  }
});

router.delete("/espacios/:id", async (req, res) => {
  try {
    const deleted = await espacioRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar espacio" });
  }
});

export default router;
