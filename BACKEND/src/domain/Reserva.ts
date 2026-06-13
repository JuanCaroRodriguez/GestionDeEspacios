import { Persona } from "./Persona";

export class Reserva {
  private id: string;
  private persona: Persona;
  private espacioId: string;
  private fecha: Date;
  private horaInicio: string;
  private horaFin: string;
  private tipo: "permanente" | "ocasional";
  private fechaInicio: Date;
  private fechaFin: Date;
  private estado: "Reservada" | "Ejecutada" | "Cancelada" | "Pendiente";
  private motivo: string;
  private id_empresa: string;

  constructor(
    id: string,
    persona: Persona,
    espacioId: string,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
    tipo: "permanente" | "ocasional",
    motivo: string,
    id_empresa: string,
    estado: "Reservada" | "Ejecutada" | "Cancelada" | "Pendiente" = "Reservada",
  ) {
    this.id = id;
    this.persona = persona;
    this.espacioId = espacioId;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.tipo = tipo;
    this.motivo = motivo;
    this.id_empresa = id_empresa;
    // Crear fecha base y clonarla para evitar mutación
    const fechaBase = new Date(fecha);
    this.fechaInicio = new Date(fechaBase);
    this.fechaInicio.setHours(
      parseInt(horaInicio.split(":")[0]),
      parseInt(horaInicio.split(":")[1]),
      0,
      0,
    );
    this.fechaFin = new Date(fechaBase);
    this.fechaFin.setHours(
      parseInt(horaFin.split(":")[0]),
      parseInt(horaFin.split(":")[1]),
      0,
      0,
    );
    this.estado = estado;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getPersona(): Persona {
    return this.persona;
  }

  public getEspacioId(): string {
    return this.espacioId;
  }

  public getFecha(): Date {
    return this.fecha;
  }

  public getHoraInicio(): string {
    return this.horaInicio;
  }

  public getHoraFin(): string {
    return this.horaFin;
  }

  public getTipo(): "permanente" | "ocasional" {
    return this.tipo;
  }

  public getFechaInicio(): Date {
    return this.fechaInicio;
  }

  public getFechaFin(): Date {
    return this.fechaFin;
  }

  public getEstado(): "Reservada" | "Ejecutada" | "Cancelada" | "Pendiente" {
    return this.estado;
  }

  public getMotivo(): string {
    return this.motivo;
  }

  public getIdEmpresa(): string {
    return this.id_empresa;
  }

  // Setters
  public setFecha(fecha: Date): void {
    this.fecha = fecha;
  }

  public setHoraInicio(horaInicio: string): void {
    this.horaInicio = horaInicio;
  }

  public setHoraFin(horaFin: string): void {
    this.horaFin = horaFin;
  }

  public setTipo(tipo: "permanente" | "ocasional"): void {
    this.tipo = tipo;
  }

  public setEstado(
    estado: "Reservada" | "Ejecutada" | "Cancelada" | "Pendiente",
  ): void {
    this.estado = estado;
  }

  public setMotivo(motivo: string): void {
    this.motivo = motivo;
  }

  public cancelar(): void {
    this.estado = "Cancelada";
    console.log(`Reserva ${this.id} ha sido cancelada`);
  }

  // Métodos para verificar disponibilidad
  public esActivaEnFecha(fecha: Date): boolean {
    if (this.estado !== "Reservada") return false;

    if (this.tipo === "ocasional") {
      // Para reservas ocasionales, verificar si es la misma fecha
      return this.esMismaFecha(this.fecha, fecha);
    } else {
      // Para reservas permanentes, verificar si es el mismo día de la semana
      return this.esMismoDiaSemana(this.fecha, fecha);
    }
  }

  public seSolapaConHorario(
    horaInicio: string,
    horaFin: string,
    fecha: Date,
  ): boolean {
    if (!this.esActivaEnFecha(fecha)) return false;

    const reservaInicio = this.convertirHoraAMinutos(this.horaInicio);
    const reservaFin = this.convertirHoraAMinutos(this.horaFin);
    const nuevaInicio = this.convertirHoraAMinutos(horaInicio);
    const nuevaFin = this.convertirHoraAMinutos(horaFin);

    // Verificar si hay solapamiento de horarios
    return (
      (nuevaInicio >= reservaInicio && nuevaInicio < reservaFin) ||
      (nuevaFin > reservaInicio && nuevaFin <= reservaFin) ||
      (nuevaInicio <= reservaInicio && nuevaFin >= reservaFin)
    );
  }

  private esMismaFecha(fecha1: Date, fecha2: Date): boolean {
    return (
      fecha1.getDate() === fecha2.getDate() &&
      fecha1.getMonth() === fecha2.getMonth() &&
      fecha1.getFullYear() === fecha2.getFullYear()
    );
  }

  private esMismoDiaSemana(fecha1: Date, fecha2: Date): boolean {
    return fecha1.getDay() === fecha2.getDay();
  }

  private convertirHoraAMinutos(hora: string): number {
    const [hours, minutes] = hora.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
