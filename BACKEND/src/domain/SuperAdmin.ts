import { Persona } from "./Persona";
import { Espacio } from "./Espacio";
import { Usuario } from "./Usuario";

export class SuperAdmin extends Persona {
  constructor(id: string, nombre: string, email: string, contraseña: string) {
    super(id, nombre, email, contraseña);
  }

  public cancelar(): void {
    console.log(`El super admin ${this.nombre} ha cancelado una reserva`);
  }

  public consultar(): void {
    console.log(
      `El super admin ${this.nombre} está consultando el sistema completo`,
    );
  }

  public realizar(): void {
    console.log(
      `El super admin ${this.nombre} está realizando una acción administrativa`,
    );
  }

  // Métodos exclusivos del SuperAdmin para gestión de espacios
  public crearEspacio(
    id: string,
    nombre: string,
    tipo: string,
    capacidad: number,
    ubicacion: string,
  ): Espacio {
    console.log(
      `Super admin ${this.nombre} está creando el espacio: ${nombre}`,
    );
    return new Espacio(id, nombre, tipo, capacidad, ubicacion);
  }

  public eliminarEspacio(espacio: Espacio): void {
    console.log(
      `Super admin ${this.nombre} está eliminando el espacio: ${espacio.getNombre()}`,
    );
  }

  public modificarEspacio(
    espacio: Espacio,
    nombre?: string,
    tipo?: string,
    capacidad?: number,
    ubicacion?: string,
  ): void {
    console.log(
      `Super admin ${this.nombre} está modificando el espacio: ${espacio.getNombre()}`,
    );

    if (nombre) espacio.setNombre(nombre);
    if (tipo) espacio.setTipo(tipo);
    if (capacidad) espacio.setCapacidad(capacidad);
    if (ubicacion) espacio.setUbicacion(ubicacion);
  }

  // Métodos exclusivos del SuperAdmin para gestión de usuarios
  public crearUsuario(
    id: string,
    nombre: string,
    email: string,
    contraseña: string,
    tipo: "estudiante" | "docente" = "estudiante",
  ): Usuario {
    console.log(
      `Super admin ${this.nombre} está creando el usuario: ${nombre} (${tipo})`,
    );
    return new Usuario(id, nombre, email, contraseña, tipo);
  }

  public eliminarUsuario(usuario: Usuario): void {
    console.log(
      `Super admin ${this.nombre} está eliminando el usuario: ${usuario.getNombre()}`,
    );
  }

  public modificarUsuario(
    usuario: Usuario,
    nombre?: string,
    email?: string,
    contraseña?: string,
    tipo?: "estudiante" | "docente",
  ): void {
    console.log(
      `Super admin ${this.nombre} está modificando el usuario: ${usuario.getNombre()}`,
    );

    if (nombre) usuario.setNombre(nombre);
    if (email) usuario.setEmail(email);
    if (contraseña) usuario.setContraseña(contraseña);
    if (tipo) usuario.setTipo(tipo);
  }

  public suspenderUsuario(usuario: Usuario): void {
    console.log(
      `Super admin ${this.nombre} está suspendiendo al usuario: ${usuario.getNombre()}`,
    );
  }

  public activarUsuario(usuario: Usuario): void {
    console.log(
      `Super admin ${this.nombre} está activando al usuario: ${usuario.getNombre()}`,
    );
  }
}
