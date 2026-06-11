export class Espacio {
  private id: string;
  private nombre: string;
  private tipo: string;
  private capacidad: number;
  private bloque: string;
  private piso: number;
  private salon: string;
  private id_empresa: string;
  private disponible: boolean;

  constructor(
    id: string,
    nombre: string,
    tipo: string,
    capacidad: number,
    bloque: string,
    piso: number,
    salon: string,
    id_empresa: string,
  ) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.capacidad = capacidad;
    this.bloque = bloque;
    this.piso = piso;
    this.salon = salon;
    this.id_empresa = id_empresa;
    this.disponible = true;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getNombre(): string {
    return this.nombre;
  }

  public getTipo(): string {
    return this.tipo;
  }

  public getCapacidad(): number {
    return this.capacidad;
  }

  public getBloque(): string {
    return this.bloque;
  }

  public getPiso(): number {
    return this.piso;
  }

  public getSalon(): string {
    return this.salon;
  }

  public getIdEmpresa(): string {
    return this.id_empresa;
  }

  public getDisponible(): boolean {
    return this.disponible;
  }

  // Setters
  public setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  public setTipo(tipo: string): void {
    this.tipo = tipo;
  }

  public setCapacidad(capacidad: number): void {
    this.capacidad = capacidad;
  }

  public setBloque(bloque: string): void {
    this.bloque = bloque;
  }

  public setPiso(piso: number): void {
    this.piso = piso;
  }

  public setSalon(salon: string): void {
    this.salon = salon;
  }

  public setIdEmpresa(id_empresa: string): void {
    this.id_empresa = id_empresa;
  }

  public setDisponible(disponible: boolean): void {
    this.disponible = disponible;
  }

  // Métodos de negocio
  public marcarComoOcupado(): void {
    this.disponible = false;
    console.log(`Espacio ${this.nombre} ahora está ocupado`);
  }

  public marcarComoDisponible(): void {
    this.disponible = true;
    console.log(`Espacio ${this.nombre} ahora está disponible`);
  }
}
