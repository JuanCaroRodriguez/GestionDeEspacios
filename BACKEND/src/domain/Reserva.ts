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
  private estado: string;

  constructor(
    id: string,
    persona: Persona,
    espacioId: string,
    fecha: Date,
    horaInicio: string,
    horaFin: string,
    tipo: "permanente" | "ocasional",
  ) {
    this.id = id;
    this.persona = persona;
    this.espacioId = espacioId;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
    this.tipo = tipo;
    this.fechaInicio = new Date(fecha);
    this.fechaInicio.setHours(
      parseInt(horaInicio.split(":")[0]),
      parseInt(horaInicio.split(":")[1]),
      0,
      0,
    );
    this.fechaFin = new Date(fecha);
    this.fechaFin.setHours(
      parseInt(horaFin.split(":")[0]),
      parseInt(horaFin.split(":")[1]),
      0,
      0,
    );
    this.estado = "activa";
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

  public getEstado(): string {
    return this.estado;
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

  public setEstado(estado: string): void {
    this.estado = estado;
  }

  public cancelar(): void {
    this.estado = "cancelada";
    console.log(`Reserva ${this.id} ha sido cancelada`);
  }
}
