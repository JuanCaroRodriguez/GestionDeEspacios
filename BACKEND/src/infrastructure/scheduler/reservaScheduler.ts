import cron from "node-cron";
import { ReservaModel } from "../models/Reserva.model";

function ahoraColombia(): Date {
  try {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  } catch {
    return new Date();
  }
}

async function marcarReservasEjecutadas(): Promise<void> {
  try {
    const ahora = ahoraColombia();
    const resultado = await ReservaModel.updateMany(
      { estado: "Reservada", fechaFin: { $lte: ahora } },
      { $set: { estado: "Ejecutada" } },
    );
    if (resultado.modifiedCount > 0) {
      console.log(`[Scheduler] ${resultado.modifiedCount} reserva(s) marcada(s) como Ejecutada`);
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

  console.log("[Scheduler] Worker de reservas iniciado (inmediato + cada hora)");
}
