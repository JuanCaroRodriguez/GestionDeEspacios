import { Router } from "express";
import { DepartamentoController } from "../controllers/departamentos.controller";

const router = Router();
const departamentoController = new DepartamentoController();

// Rutas para departamentos
router.post("/", departamentoController.createDepartamento);
router.get("/:id", departamentoController.getDepartamentoById);
router.get(
  "/empresa/:id_empresa",
  departamentoController.getDepartamentosByEmpresa,
);
router.put(
  "/update-by-empresa",
  departamentoController.updateDepartamentosByEmpresa,
);
router.put("/:id", departamentoController.updateDepartamento);
router.delete("/:id", departamentoController.deleteDepartamento);

export default router;
