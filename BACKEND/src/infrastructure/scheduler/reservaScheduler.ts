import cron from "node-cron";
import { ReservaModel } from "../models/Reserva.model";

function ahoraColombia(): Date {
  try {
    return new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }),
    );
  } catch {
    return new Date();
  }
}

async function marcarReservasEjecutadas(): Promise<void> {
  try {
    const ahora = ahoraColombia();
    console.log(`[Scheduler] Hora actual Bogotá: ${ahora.toISOString()}`);

    // Marcar reservas ocasionales como Ejecutadas
    const resultadoEjecutadas = await ReservaModel.updateMany(
      {
        estado: "Reservada",
        tipo: "ocasional",
        fechaFin: { $lte: ahora },
      },
      { $set: { estado: "Ejecutada" } },
    );
    if (resultadoEjecutadas.modifiedCount > 0) {
      console.log(
        `[Scheduler] ${resultadoEjecutadas.modifiedCount} reserva(s) marcada(s) como Ejecutada`,
      );
    }

    // Cancelar reservas pendientes vencidas
    const resultadoCanceladas = await ReservaModel.updateMany(
      {
        estado: "Pendiente",
        tipo: "ocasional",
        fechaFin: { $lte: ahora },
      },
      { $set: { estado: "Cancelada" } },
    );
    if (resultadoCanceladas.modifiedCount > 0) {
      console.log(
        `[Scheduler] ${resultadoCanceladas.modifiedCount} reserva(s) pendiente(s) marcada(s) como Cancelada`,
      );
    }
  } catch (error) {
    console.error("[Scheduler] Error al marcar reservas ejecutadas:", error);
  }
}

export function iniciarSchedulerReservas(): void {
  // Ejecutar inmediatamente al iniciar la aplicación
  marcarReservasEjecutadas();

  // Programar ejecución cada hora (minuto 0 de cada hora)
  cron.schedule("0 * * * *", () => {
    marcarReservasEjecutadas();
  });

  console.log(
    "[Scheduler] Worker de reservas iniciado (inmediato + cada hora)",
  );
}
