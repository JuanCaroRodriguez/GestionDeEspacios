export class Empresa {
    private id: string;
    private nombre: string;
    private nit: string;
    private createdAt: Date;
    private updatedAt: Date;

    constructor(id: string, nombre: string, nit: string) {
        this.id = id;
        this.nombre = nombre;
        this.nit = nit;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public getNit(): string {
        return this.nit;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    // Setters
    public setNombre(nombre: string): void {
        this.nombre = nombre;
        this.updatedAt = new Date();
    }

    public setNit(nit: string): void {
        this.nit = nit;
        this.updatedAt = new Date();
    }

    public setUpdatedAt(date: Date): void {
        this.updatedAt = date;
    }
}
