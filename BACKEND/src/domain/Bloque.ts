export interface PisoConfig {
    numero: number;
    cantidadSalones: number;
    salones: {
        numero: string;
        nombre?: string;
    }[];
}

export class Bloque {
    private id: string;
    private nombre: string;
    private id_empresa: string;
    private pisos: PisoConfig[];
    private createdAt: Date;
    private updatedAt: Date;

    constructor(id: string, nombre: string, id_empresa: string) {
        this.id = id;
        this.nombre = nombre;
        this.id_empresa = id_empresa;
        this.pisos = [];
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

    public getIdEmpresa(): string {
        return this.id_empresa;
    }

    public getPisos(): PisoConfig[] {
        return this.pisos;
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

    public setIdEmpresa(id_empresa: string): void {
        this.id_empresa = id_empresa;
        this.updatedAt = new Date();
    }

    public setUpdatedAt(date: Date): void {
        this.updatedAt = date;
    }

    // Métodos para gestión de pisos
    public addPiso(numero: number, cantidadSalones: number): void {
        // Verificar si el piso ya existe
        const existingPiso = this.pisos.find(p => p.numero === numero);
        if (existingPiso) {
            throw new Error(`El piso ${numero} ya existe en el bloque`);
        }

        // Crear salones para el piso
        const salones = [];
        for (let i = 1; i <= cantidadSalones; i++) {
            salones.push({
                numero: `${i.toString().padStart(2, '0')}`,
                nombre: undefined
            });
        }

        this.pisos.push({
            numero,
            cantidadSalones,
            salones
        });

        // Ordenar pisos por número
        this.pisos.sort((a, b) => a.numero - b.numero);
        this.updatedAt = new Date();
    }

    public removePiso(numero: number): void {
        const pisoIndex = this.pisos.findIndex(p => p.numero === numero);
        if (pisoIndex === -1) {
            throw new Error(`El piso ${numero} no existe en el bloque`);
        }

        this.pisos.splice(pisoIndex, 1);
        this.updatedAt = new Date();
    }

    public updatePiso(numero: number, cantidadSalones: number): void {
        const piso = this.pisos.find(p => p.numero === numero);
        if (!piso) {
            throw new Error(`El piso ${numero} no existe en el bloque`);
        }

        // Si la cantidad es diferente, reconfigurar los salones
        if (piso.cantidadSalones !== cantidadSalones) {
            const salones = [];
            for (let i = 1; i <= cantidadSalones; i++) {
                salones.push({
                    numero: `${i.toString().padStart(2, '0')}`,
                    nombre: undefined
                });
            }
            piso.cantidadSalones = cantidadSalones;
            piso.salones = salones;
        }

        this.updatedAt = new Date();
    }

    public getTotalSalones(): number {
        return this.pisos.reduce((total, piso) => total + piso.cantidadSalones, 0);
    }

    public getTotalPisos(): number {
        return this.pisos.length;
    }
}
