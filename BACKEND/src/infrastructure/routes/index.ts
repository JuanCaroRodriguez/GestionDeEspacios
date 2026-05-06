import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import espacioRoutes from "./espacio.routes";
import reservaRoutes from "./reserva.routes";
import superadminRoutes from "./superadmin.routes";
import administradorRoutes from "./administrador.routes";
import authRoutes from "./auth.routes";

const router = Router();

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas principales
router.use("/usuarios", usuarioRoutes);
router.use("/espacios", espacioRoutes);
router.use("/reservas", reservaRoutes);
router.use("/superadmin", superadminRoutes);
router.use("/administrador", administradorRoutes);

// Ruta de健康 check
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API de Gestión de Espacios funcionando",
    timestamp: new Date().toISOString(),
  });
});

export default router;
