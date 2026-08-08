import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { IntervaloRepository } from "../repositories/Intervalo.repository";
import { EmpresaRepository } from "../repositories/Empresa.repository";
import { Intervalo } from "../../domain/Intervalo";
import { validarIntervalos, IntervaloInput } from "../utils/intervalos.utils";
import { verifyToken } from "../utils/jwt.handle";

const router = Router({ mergeParams: true });
const intervaloRepository = new IntervaloRepository();
const empresaRepository = new EmpresaRepository();

/**
 * GET /api/empresas/:idEmpresa/intervalos
 * Devuelve las franjas horarias activas de una empresa ordenadas por 'orden'.
 */
router.get("/", async (req, res) => {
  try {
    const idEmpresa: string = req.params["idEmpresa"];

    const empresa = await empresaRepository.findById(idEmpresa);
    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    const intervalos = await intervaloRepository.findByEmpresa(idEmpresa);

    return res.json(
      intervalos.map((i) => ({
        id: i.getId(),
        id_empresa: i.getIdEmpresa(),
        hora_inicio: i.getHoraInicio(),
        hora_fin: i.getHoraFin(),
        orden: i.getOrden(),
        activo: i.getActivo(),
      })),
    );
  } catch (error) {
    console.error("Error al obtener intervalos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * PUT /api/empresas/:idEmpresa/intervalos
 * Reemplaza toda la configuración de franjas horarias de una empresa.
 * Requiere rol superadmin en el token JWT.
 *
 * Body: { intervalos: [{ hora_inicio, hora_fin }] }
 */
router.put("/", async (req, res) => {
  // --- Autenticación y autorización ---
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }
  const tokenStr = authHeader.split(" ").pop();
  let decoded: any;
  try {
    decoded = verifyToken(tokenStr);
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
  if (decoded?.tipo !== "superadmin") {
    return res
      .status(403)
      .json({
        error:
          "Solo el superadministrador puede modificar las franjas horarias",
      });
  }

  // --- Validar empresa ---
  const idEmpresa: string = req.params["idEmpresa"];
  const empresa = await empresaRepository.findById(idEmpresa);
  if (!empresa) {
    return res.status(404).json({ error: "Empresa no encontrada" });
  }

  // --- Validar body ---
  const { intervalos: intervalosBody } = req.body;
  if (!Array.isArray(intervalosBody)) {
    return res
      .status(400)
      .json({ error: "Se requiere un array de intervalos" });
  }

  // --- Validación de formato y superposiciones (centralizada) ---
  try {
    validarIntervalos(intervalosBody as IntervaloInput[]);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  // --- Ordenar y asignar orden antes de persistir ---
  const { horaAMinutos } = await import("../utils/intervalos.utils");
  const ordenados = [...intervalosBody].sort(
    (a, b) => horaAMinutos(a.hora_inicio) - horaAMinutos(b.hora_inicio),
  );

  // --- Persistencia atómica: borrar los existentes y crear los nuevos ---
  try {
    await intervaloRepository.deleteByEmpresa(idEmpresa);

    const entidades = ordenados.map(
      (item, idx) =>
        new Intervalo(
          `INT-${uuidv4().substring(0, 8).toUpperCase()}`,
          idEmpresa,
          item.hora_inicio,
          item.hora_fin,
          idx + 1,
        ),
    );

    const guardados = await intervaloRepository.createMany(entidades);

    return res.json(
      guardados.map((i) => ({
        id: i.getId(),
        id_empresa: i.getIdEmpresa(),
        hora_inicio: i.getHoraInicio(),
        hora_fin: i.getHoraFin(),
        orden: i.getOrden(),
        activo: i.getActivo(),
      })),
    );
  } catch (error) {
    console.error("Error al guardar intervalos:", error);
    return res
      .status(500)
      .json({ error: "Error interno al guardar las franjas horarias" });
  }
});

export default router;
