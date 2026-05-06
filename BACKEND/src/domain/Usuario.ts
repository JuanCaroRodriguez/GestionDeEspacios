import { Persona } from "./Persona";

export class Usuario extends Persona {
  private tipo: "estudiante" | "docente";
  private estado: "activo" | "inactivo" | "suspendido";

  constructor(
    id: string,
    nombre: string,
    email: string,
    contraseña: string,
    tipo: "estudiante" | "docente" = "estudiante",
    estado: "activo" | "inactivo" | "suspendido" = "activo",
  ) {
    super(id, nombre, email, contraseña);
    this.tipo = tipo;
    this.estado = estado;
  }

  // Getter y Setter para tipo
  public getTipo(): "estudiante" | "docente" {
    return this.tipo;
  }

  public setTipo(tipo: "estudiante" | "docente"): void {
    this.tipo = tipo;
  }

  // Getter y Setter para estado
  public getEstado(): "activo" | "inactivo" | "suspendido" {
    return this.estado;
  }

  public setEstado(estado: "activo" | "inactivo" | "suspendido"): void {
    this.estado = estado;
  }

  public cancelar(): void {
    console.log(`El usuario ${this.nombre} ha cancelado una reserva`);
  }

  public consultar(): void {
    console.log(
      `El usuario ${this.nombre} está consultando espacios disponibles`,
    );
  }

  public realizar(): void {
    console.log(`El usuario ${this.nombre} está realizando una reserva`);
  }
}
