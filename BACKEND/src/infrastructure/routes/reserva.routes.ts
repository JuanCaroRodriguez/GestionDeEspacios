import { Router } from "express";
import { ReservaRepository } from "../repositories/Reserva.repository";
import { EspacioRepository } from "../repositories/Espacio.repository";

const router = Router();
const reservaRepository = new ReservaRepository();
const espacioRepository = new EspacioRepository();

// GET - Obtener todas las reservas
router.get("/", async (req, res) => {
  try {
    const reservas = await reservaRepository.findAll();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas" });
  }
});

// GET - Obtener reserva por ID
router.get("/:id", async (req, res) => {
  try {
    const reserva = await reservaRepository.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reserva" });
  }
});

// GET - Obtener reservas por espacio
router.get("/espacio/:espacioId", async (req, res) => {
  try {
    const reservas = await reservaRepository.findByEspacioId(
      req.params.espacioId,
    );
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas del espacio" });
  }
});

// GET - Obtener reservas por estado
router.get("/estado/:estado", async (req, res) => {
  try {
    const reservas = await reservaRepository.findByEstado(req.params.estado);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas por estado" });
  }
});

// GET - Obtener reservas activas
router.get("/activas", async (req, res) => {
  try {
    const reservas = await reservaRepository.findActiveReservas();
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas activas" });
  }
});

// GET - Obtener reservas en rango de fechas
router.get("/fechas", async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const inicio = new Date(fechaInicio as string);
    const fin = new Date(fechaFin as string);

    const reservas = await reservaRepository.findByDateRange(inicio, fin);
    res.json(reservas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener reservas en rango de fechas" });
  }
});

// GET - Obtener reservas de espacio en rango de fechas
router.get("/espacio/:espacioId/fechas", async (req, res) => {
  try {
    const { espacioId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res
        .status(400)
        .json({ error: "Se requieren fechaInicio y fechaFin" });
    }

    const inicio = new Date(fechaInicio as string);
    const fin = new Date(fechaFin as string);

    const reservas = await reservaRepository.findReservasByEspacioAndDateRange(
      espacioId,
      inicio,
      fin,
    );
    res.json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas del espacio en rango de fechas",
    });
  }
});

// POST - Crear reserva
router.post("/", async (req, res) => {
  try {
    const {
      id,
      personaId,
      espacioId,
      fecha,
      horaInicio,
      horaFin,
      tipo,
      motivo,
      id_empresa,
      estado,
    } = req.body;

    // Validaciones
    if (
      !id ||
      !personaId ||
      !espacioId ||
      !fecha ||
      !horaInicio ||
      !horaFin ||
      !tipo ||
      !id_empresa
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Validar tipo
    if (!["permanente", "ocasional"].includes(tipo)) {
      return res
        .status(400)
        .json({ error: "El tipo debe ser permanente u ocasional" });
    }

    // Verificar si ya existe
    const existsById = await reservaRepository.existsById(id);
    if (existsById) {
      return res
        .status(400)
        .json({ error: "El ID de reserva ya está registrado" });
    }

    const periodoInicio = horaInicio.slice(-2).toUpperCase();
    const partesInicio = horaInicio.slice(0, -2).trim().split(":");

    let hInicio = parseInt(partesInicio[0]);
    const mInicio = parseInt(partesInicio[1]);

    const periodoFin = horaFin.slice(-2).toUpperCase();
    const partesFin = horaFin.slice(0, -2).trim().split(":");

    let hFin = parseInt(partesFin[0]);
    const mFin = parseInt(partesFin[1]);

    if (periodoInicio === "PM" && hInicio !== 12) {
      hInicio += 12;
    }

    if (periodoInicio === "AM" && hInicio === 12) {
      hInicio = 0;
    }

    if (periodoFin === "PM" && hFin !== 12) {
      hFin += 12;
    }

    if (periodoFin === "AM" && hFin === 12) {
      hFin = 0;
    }

    const inicio = hInicio * 60 + mInicio;
    const fin = hFin * 60 + mFin;

    console.log("Inicio:", inicio, "Fin:", fin);

    if (inicio >= fin) {
      return res.status(400).json({
        error: "La hora de inicio debe ser anterior a la hora de fin",
      });
    }

    // Obtener la persona
    const { Usuario } = await import("../../domain/Usuario");
    const usuario = new Usuario(personaId, "", "", "", "estudiante"); // Temporal, se debe obtener de la BD

    // Crear reserva
    const { Reserva } = await import("../../domain/Reserva");

    // Crear fecha local para evitar problemas de timezone
    const fechaLocal = new Date(fecha + "T00:00:00");
    console.log(
      "🔍 DEBUG BACKEND - Creando reserva con estado:",
      estado || "Reservada",
    );

    const reserva = new Reserva(
      id,
      usuario,
      espacioId,
      fechaLocal,
      horaInicio,
      horaFin,
      tipo,
      motivo || "Sin motivo especificado",
      id_empresa,
      estado || "Reservada",
    );

    console.log(
      "🔍 DEBUG BACKEND - Reserva creada, estado:",
      reserva.getEstado(),
    );

    const createdReserva = await reservaRepository.create(reserva);
    res.status(201).json(createdReserva);
  } catch (error) {
    res.status(500).json({ error: "Error al crear reserva" });
  }
});

// PUT - Cancelar reserva
router.put("/:id/cancelar", async (req, res) => {
  try {
    const cancelled = await reservaRepository.cancelReserva(req.params.id);
    if (!cancelled) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva cancelada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
});

// DELETE - Eliminar reserva
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await reservaRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar reserva" });
  }
});

// GET - Obtener reservas por persona (Mis Reservas)
router.get("/persona/:personaId", async (req, res) => {
  console.log("entro");
  try {
    const { personaId } = req.params;

    if (!personaId) {
      return res.status(400).json({ error: "ID de persona es requerido" });
    }

    const reservas = await reservaRepository.findByPersonaId(personaId);

    console.log("🔍 DEBUG BACKEND - Reservas crudas:", reservas);
    console.log("🔍 DEBUG BACKEND - Primera reserva cruda:", reservas[0]);

    // Mapear a formato seguro sin dependencias de persona
    const reservasSeguras = await Promise.all(
      reservas.map(async (reserva) => {
        const persona = reserva.getPersona();

        // Obtener información del espacio
        let espacioNombre = "Espacio no encontrado";
        try {
          const espacio = await espacioRepository.findById(
            reserva.getEspacioId(),
          );
          if (espacio) {
            espacioNombre = espacio.getNombre();
          }
        } catch (error) {
          console.log(
            `Error obteniendo espacio ${reserva.getEspacioId()}:`,
            error,
          );
        }

        return {
          id: reserva.getId(),
          personaId: persona.getId(),
          personaNombre: persona.getNombre(),
          espacioId: reserva.getEspacioId(),
          espacioNombre: espacioNombre,
          fecha: reserva.getFecha(),
          horaInicio: reserva.getHoraInicio(),
          horaFin: reserva.getHoraFin(),
          tipo: reserva.getTipo(),
          estado: reserva.getEstado(),
          motivo: reserva.getMotivo(),
          id_empresa: reserva.getIdEmpresa(),
          fechaInicio: reserva.getFechaInicio(),
          fechaFin: reserva.getFechaFin(),
        };
      }),
    );

    console.log("🔍 DEBUG BACKEND - Reservas mapeadas:", reservasSeguras);
    console.log(
      "🔍 DEBUG BACKEND - Primera reserva mapeada:",
      reservasSeguras[0],
    );

    res.json(reservasSeguras);
  } catch (error) {
    console.error("Error al obtener reservas por persona:", error);
    res.status(500).json({ error: "Error al obtener reservas por persona" });
  }
});

// GET - Obtener reservas por empresa
router.get("/empresa/:id_empresa", async (req, res) => {
  try {
    const { id_empresa } = req.params;
    const reservas = await reservaRepository.findByEmpresa(id_empresa);

    // Mapear a formato seguro con el estado correcto
    const reservasSeguras = await Promise.all(
      reservas.map(async (reserva) => {
        const persona = reserva.getPersona();

        // Obtener información del espacio
        let espacioNombre = "Espacio no encontrado";
        try {
          const espacio = await espacioRepository.findById(
            reserva.getEspacioId(),
          );
          if (espacio) {
            espacioNombre = espacio.getNombre();
          }
        } catch (error) {
          console.log(
            `Error obteniendo espacio ${reserva.getEspacioId()}:`,
            error,
          );
        }

        return {
          id: reserva.getId(),
          personaId: persona.getId(),
          personaNombre: persona.getNombre(),
          espacioId: reserva.getEspacioId(),
          espacioNombre: espacioNombre,
          fecha: reserva.getFecha(),
          horaInicio: reserva.getHoraInicio(),
          horaFin: reserva.getHoraFin(),
          tipo: reserva.getTipo(),
          estado: reserva.getEstado(), // ESTE ES EL CAMPO CLAVE
          motivo: reserva.getMotivo(),
          id_empresa: reserva.getIdEmpresa(),
          fechaInicio: reserva.getFechaInicio(),
          fechaFin: reserva.getFechaFin(),
        };
      }),
    );

    res.json(reservasSeguras);
  } catch (error) {
    console.error("Error al obtener reservas por empresa:", error);
    res.status(500).json({ error: "Error al obtener reservas por empresa" });
  }
});

// PUT - Actualizar estado de una reserva
router.put("/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea válido
    const estadosValidos = ["Pendiente", "Reservada", "Cancelada", "Ejecutada"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    // Actualizar la reserva
    const reservaActualizada = await reservaRepository.updateEstado(id, estado);

    if (!reservaActualizada) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json({
      message: "Estado actualizado exitosamente",
      reserva: {
        id: reservaActualizada.getId(),
        estado: reservaActualizada.getEstado(),
      },
    });
  } catch (error) {
    console.error("Error al actualizar estado de reserva:", error);
    res.status(500).json({ error: "Error al actualizar estado de reserva" });
  }
});

export default router;
