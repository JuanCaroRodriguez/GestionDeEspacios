import { Router } from "express";
import { DisponibilidadService, DisponibilidadRequest } from "../../services/disponibilidad.service";
import { ReservaRepository } from "../repositories/Reserva.repository";

const router = Router();
const reservaRepository = new ReservaRepository();

/**
 * POST /api/disponibilidad/verificar
 * Verifica si un espacio está disponible en un fecha y horario específicos
 */
router.post("/verificar", async (req, res) => {
  try {
    const { espacioId, fecha, horaInicio, horaFin, id_empresa } = req.body;

    // Validar datos de entrada
    if (!espacioId || !fecha || !horaInicio || !horaFin || !id_empresa) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos: espacioId, fecha, horaInicio, horaFin, id_empresa",
      });
    }

   

    // Validar que horaInicio sea menor que horaFin
    const inicioMinutos = convertirHoraAMinutos(horaInicio);
    const finMinutos = convertirHoraAMinutos(horaFin);
    if (inicioMinutos >= finMinutos) {
      return res.status(400).json({
        success: false,
        message: "La hora de inicio debe ser menor que la hora de fin",
      });
    }

    // Convertir fecha
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      });
    }

    // Crear solicitud de disponibilidad
    const request: DisponibilidadRequest = {
      espacioId,
      fecha: fechaDate,
      horaInicio,
      horaFin,
      id_empresa,
    };

    // Obtener todas las reservas existentes
    const reservasExistentes = await reservaRepository.findAll();

    // Verificar disponibilidad
    const resultado = await DisponibilidadService.verificarDisponibilidad(
      request,
      reservasExistentes
    );

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/disponibilidad/horarios-disponibles
 * Obtiene los horarios disponibles para un espacio en una fecha específica
 */
router.get("/horarios-disponibles", async (req, res) => {
  try {
    const { espacioId, fecha, id_empresa, horaApertura, horaCierre, duracionMinima } = req.query;

    // Validar datos de entrada
    if (!espacioId || !fecha || !id_empresa) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos: espacioId, fecha, id_empresa",
      });
    }

    // Convertir fecha
    const fechaDate = new Date(fecha as string);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Formato de fecha inválido",
      });
    }

    // Obtener todas las reservas existentes
    const reservasExistentes = await reservaRepository.findAll();

    // Obtener horarios disponibles
    const horariosDisponibles = await DisponibilidadService.obtenerHorariosDisponibles(
      espacioId as string,
      fechaDate,
      id_empresa as string,
      reservasExistentes,
      horaApertura as string,
      horaCierre as string,
      duracionMinima ? parseInt(duracionMinima as string) : undefined
    );

    res.json({
      success: true,
      data: horariosDisponibles,
    });
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

/**
 * POST /api/disponibilidad/verificar-multiple
 * Verifica disponibilidad para múltiples espacios y horarios
 */
router.post("/verificar-multiple", async (req, res) => {
  try {
    const { solicitudes } = req.body;

    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de solicitudes",
      });
    }

    // Validar cada solicitud
    for (const solicitud of solicitudes) {
      const { espacioId, fecha, horaInicio, horaFin, id_empresa } = solicitud;
      if (!espacioId || !fecha || !horaInicio || !horaFin || !id_empresa) {
        return res.status(400).json({
          success: false,
          message: "Cada solicitud debe contener: espacioId, fecha, horaInicio, horaFin, id_empresa",
        });
      }
    }

    // Obtener todas las reservas existentes
    const reservasExistentes = await reservaRepository.findAll();

    // Verificar disponibilidad para cada solicitud
    const resultados = [];
    for (const solicitud of solicitudes) {
      const request: DisponibilidadRequest = {
        espacioId: solicitud.espacioId,
        fecha: new Date(solicitud.fecha),
        horaInicio: solicitud.horaInicio,
        horaFin: solicitud.horaFin,
        id_empresa: solicitud.id_empresa,
      };

      const resultado = await DisponibilidadService.verificarDisponibilidad(
        request,
        reservasExistentes
      );

      resultados.push({
        solicitud,
        resultado,
      });
    }

    res.json({
      success: true,
      data: resultados,
    });
  } catch (error) {
    console.error("Error al verificar disponibilidad múltiple:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

function convertirHoraAMinutos(hora: string): number {
  const [hours, minutes] = hora.split(":").map(Number);
  return hours * 60 + minutes;
}

export default router;
