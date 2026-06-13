import { Persona } from "./Persona";

export class Usuario extends Persona {
  private tipo: "estudiante" | "docente";
  private id_empresa: string | null;

  constructor(
    id: string,
    nombre: string,
    email: string,
    contraseña: string,
    tipo: "estudiante" | "docente" = "estudiante",
    estado: "activo" | "inactivo" | "suspendido" = "activo",
    id_empresa: string | null = null,
  ) {
    super(id, nombre, email, contraseña, estado);
    this.tipo = tipo;
    this.id_empresa = id_empresa;
  }

  // Getter y Setter para tipo
  public getTipo(): "estudiante" | "docente" {
    return this.tipo;
  }

  public setTipo(tipo: "estudiante" | "docente"): void {
    this.tipo = tipo;
  }

  // Getter y Setter para id_empresa
  public getIdEmpresa(): string | null {
    return this.id_empresa;
  }

  public setIdEmpresa(id_empresa: string | null): void {
    this.id_empresa = id_empresa;
  }

  // Getter y Setter para estado (sobreescribir para tipado específico)
  public getEstado(): "activo" | "inactivo" | "suspendido" {
    return super.getEstado() as "activo" | "inactivo" | "suspendido";
  }

  public setEstado(estado: "activo" | "inactivo" | "suspendido"): void {
    super.setEstado(estado);
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
