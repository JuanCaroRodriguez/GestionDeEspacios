export class Intervalo {
    private id: string;
    private id_empresa: string;
    private hora_inicio: string;
    private hora_fin: string;
    private orden: number;
    private activo: boolean;
    private createdAt: Date;
    private updatedAt: Date;

    constructor(
        id: string,
        id_empresa: string,
        hora_inicio: string,
        hora_fin: string,
        orden: number,
        activo: boolean = true
    ) {
        this.id = id;
        this.id_empresa = id_empresa;
        this.hora_inicio = hora_inicio;
        this.hora_fin = hora_fin;
        this.orden = orden;
        this.activo = activo;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public getId(): string { return this.id; }
    public getIdEmpresa(): string { return this.id_empresa; }
    public getHoraInicio(): string { return this.hora_inicio; }
    public getHoraFin(): string { return this.hora_fin; }
    public getOrden(): number { return this.orden; }
    public getActivo(): boolean { return this.activo; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getUpdatedAt(): Date { return this.updatedAt; }

    public setHoraInicio(hora: string): void {
        this.hora_inicio = hora;
        this.updatedAt = new Date();
    }

    public setHoraFin(hora: string): void {
        this.hora_fin = hora;
        this.updatedAt = new Date();
    }

    public setOrden(orden: number): void {
        this.orden = orden;
        this.updatedAt = new Date();
    }

    public setActivo(activo: boolean): void {
        this.activo = activo;
        this.updatedAt = new Date();
    }
}
