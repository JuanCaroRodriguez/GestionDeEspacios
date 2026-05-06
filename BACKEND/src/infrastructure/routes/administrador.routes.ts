import { Router } from "express";
import { AdministradorController } from "../controllers/Administrador.controller";

const router = Router();
const administradorController = new AdministradorController();

// GET - Obtener todos los administradores
router.get("/", (req, res) => administradorController.getAll(req, res));

// GET - Obtener administrador por ID
router.get("/:id", (req, res) => administradorController.getById(req, res));

// POST - Evaluar solicitud de reserva de laboratorio
router.post("/evaluar-reserva-laboratorio", (req, res) =>
  administradorController.evaluarReservaLaboratorio(req, res),
);

// PUT - Actualizar administrador
router.put("/:id", (req, res) => administradorController.update(req, res));

// DELETE - Eliminar administrador
router.delete("/:id", (req, res) => administradorController.delete(req, res));

export default router;
