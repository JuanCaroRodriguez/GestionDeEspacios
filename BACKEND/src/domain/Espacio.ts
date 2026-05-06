export class Espacio {
    private id: string;
    private nombre: string;
    private tipo: string;
    private capacidad: number;
    private ubicacion: string;
    private disponible: boolean;

    constructor(id: string, nombre: string, tipo: string, capacidad: number, ubicacion: string) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.capacidad = capacidad;
        this.ubicacion = ubicacion;
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

    public getUbicacion(): string {
        return this.ubicacion;
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

    public setUbicacion(ubicacion: string): void {
        this.ubicacion = ubicacion;
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
