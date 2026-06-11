import { Persona } from "./Persona";
import { Espacio } from "./Espacio";
import { Usuario } from "./Usuario";

export class SuperAdmin extends Persona {
  private id_empresa?: string;

  constructor(
    id: string,
    nombre: string,
    email: string,
    contraseña: string,
    id_empresa?: string,
  ) {
    super(id, nombre, email, contraseña);
    this.id_empresa = id_empresa;
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
    bloque: string,
    piso: number,
    salon: string,
    id_empresa: string,
  ): Espacio {
    console.log(
      `Super admin ${this.nombre} está creando el espacio: ${nombre}`,
    );
    return new Espacio(
      id,
      nombre,
      tipo,
      capacidad,
      bloque,
      piso,
      salon,
      id_empresa,
    );
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
    bloque?: string,
    salon?: string,
  ): void {
    console.log(
      `Super admin ${this.nombre} está modificando el espacio: ${espacio.getNombre()}`,
    );

    if (nombre) espacio.setNombre(nombre);
    if (tipo) espacio.setTipo(tipo);
    if (capacidad) espacio.setCapacidad(capacidad);
    if (bloque) espacio.setBloque(bloque);
    if (salon) espacio.setSalon(salon);
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

  // Métodos para gestión de empresa
  public getIdEmpresa(): string | undefined {
    return this.id_empresa;
  }

  public setIdEmpresa(id_empresa: string): void {
    this.id_empresa = id_empresa;
  }
}
