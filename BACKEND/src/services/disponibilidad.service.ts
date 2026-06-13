import { Reserva } from "../domain/Reserva";

export interface DisponibilidadRequest {
  espacioId: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  id_empresa: string;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  reservasSolapadas: Reserva[];
  mensaje?: string;
}

export class DisponibilidadService {
  /**
   * Verifica si un espacio está disponible en un fecha y horario específicos
   * considerando reservas permanentes y ocasionales
   */
  static async verificarDisponibilidad(
    request: DisponibilidadRequest,
    reservasExistentes: Reserva[]
  ): Promise<DisponibilidadResponse> {
    const { espacioId, fecha, horaInicio, horaFin, id_empresa } = request;

    // Filtrar reservas del espacio y empresa que estén activas
    const reservasRelevantes = reservasExistentes.filter(
      reserva =>
        reserva.getEspacioId() === espacioId &&
        reserva.getIdEmpresa() === id_empresa &&
        reserva.getEstado() === "Reservada"
    );

    // Verificar solapamiento con cada reserva
    const reservasSolapadas: Reserva[] = [];

    for (const reserva of reservasRelevantes) {
      if (reserva.seSolapaConHorario(horaInicio, horaFin, fecha)) {
        reservasSolapadas.push(reserva);
      }
    }

    const disponible = reservasSolapadas.length === 0;

    return {
      disponible,
      reservasSolapadas,
      mensaje: disponible
        ? "El espacio está disponible en el horario solicitado"
        : this.generarMensajeConflicto(reservasSolapadas),
    };
  }

  /**
   * Genera un mensaje detallado sobre los conflictos de horario
   */
  private static generarMensajeConflicto(reservasSolapadas: Reserva[]): string {
    if (reservasSolapadas.length === 0) return "";

    const mensajes = reservasSolapadas.map(reserva => {
      const tipo = reserva.getTipo();
      const horaInicio = reserva.getHoraInicio();
      const horaFin = reserva.getHoraFin();
      const persona = reserva.getPersona().getNombre();
      const motivo = reserva.getMotivo();

      if (tipo === "permanente") {
        const diaSemana = this.obtenerNombreDia(reserva.getFecha().getDay());
        return `Reserva permanente los ${diaSemana} de ${horaInicio} a ${horaFin} (${persona} - ${motivo})`;
      } else {
        const fecha = reserva.getFecha().toLocaleDateString();
        return `Reserva ocasional el ${fecha} de ${horaInicio} a ${horaFin} (${persona} - ${motivo})`;
      }
    });

    return `Conflicto de horario:\n${mensajes.join("\n")}`;
  }

  /**
   * Obtiene el nombre del día de la semana
   */
  private static obtenerNombreDia(dia: number): string {
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    return dias[dia];
  }

  /**
   * Obtiene los horarios disponibles para un espacio en una fecha específica
   */
  static async obtenerHorariosDisponibles(
    espacioId: string,
    fecha: Date,
    id_empresa: string,
    reservasExistentes: Reserva[],
    horaApertura: string = "07:00",
    horaCierre: string = "22:00",
    duracionMinima: number = 30 // minutos
  ): Promise<{ horaInicio: string; horaFin: string }[]> {
    // Filtrar reservas relevantes para el día
    const reservasDelDia = reservasExistentes.filter(
      reserva =>
        reserva.getEspacioId() === espacioId &&
        reserva.getIdEmpresa() === id_empresa &&
        reserva.getEstado() === "Reservada" &&
        reserva.esActivaEnFecha(fecha)
    );

    // Generar todos los posibles horarios
    const horariosDisponibles: { horaInicio: string; horaFin: string }[] = [];
    const aperturaMinutos = this.convertirHoraAMinutos(horaApertura);
    const cierreMinutos = this.convertirHoraAMinutos(horaCierre);

    // Ordenar reservas por hora de inicio
    reservasDelDia.sort((a, b) => {
      const minutosA = this.convertirHoraAMinutos(a.getHoraInicio());
      const minutosB = this.convertirHoraAMinutos(b.getHoraInicio());
      return minutosA - minutosB;
    });

    let horaActual = aperturaMinutos;

    for (const reserva of reservasDelDia) {
      const reservaInicio = this.convertirHoraAMinutos(reserva.getHoraInicio());
      
      // Agregar horarios disponibles antes de cada reserva
      while (horaActual + duracionMinima <= reservaInicio) {
        horariosDisponibles.push({
          horaInicio: this.convertirMinutosAHora(horaActual),
          horaFin: this.convertirMinutosAHora(horaActual + duracionMinima),
        });
        horaActual += duracionMinima;
      }
      
      // Saltar al final de la reserva
      const reservaFin = this.convertirHoraAMinutos(reserva.getHoraFin());
      horaActual = Math.max(horaActual, reservaFin);
    }

    // Agregar horarios disponibles después de la última reserva
    while (horaActual + duracionMinima <= cierreMinutos) {
      horariosDisponibles.push({
        horaInicio: this.convertirMinutosAHora(horaActual),
        horaFin: this.convertirMinutosAHora(horaActual + duracionMinima),
      });
      horaActual += duracionMinima;
    }

    return horariosDisponibles;
  }

  private static convertirHoraAMinutos(hora: string): number {
    const [hours, minutes] = hora.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private static convertirMinutosAHora(minutos: number): string {
    const hours = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }
}
