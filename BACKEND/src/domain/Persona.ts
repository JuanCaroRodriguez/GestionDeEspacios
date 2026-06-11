import { Acciones } from "./interfaces/Acciones";

export abstract class Persona implements Acciones {
  protected id: string;
  protected nombre: string;
  protected email: string;
  protected contraseña: string;
  protected estado: string;

  constructor(
    id: string,
    nombre: string,
    email: string,
    contraseña: string,
    estado: string = "activo",
  ) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.contraseña = contraseña;
    this.estado = estado;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getEmail(): string {
    return this.email;
  }

  public getContraseña(): string {
    return this.contraseña;
  }

  public getEstado(): string {
    return this.estado;
  }

  // Setters
  public setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setContraseña(contraseña: string): void {
    this.contraseña = contraseña;
  }

  public setEstado(estado: string): void {
    this.estado = estado;
  }

  // Implementación de la interfaz Acciones
  public abstract cancelar(): void;
  public abstract consultar(): void;
  public abstract realizar(): void;
}
