import { Persona } from './Persona';

export class Reserva {
    private id: string;
    private persona: Persona;
    private espacioId: string;
    private fechaInicio: Date;
    private fechaFin: Date;
    private estado: string;

    constructor(id: string, persona: Persona, espacioId: string, fechaInicio: Date, fechaFin: Date) {
        this.id = id;
        this.persona = persona;
        this.espacioId = espacioId;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = 'activa';
    }

    // Getters
    public getId(): string {
        return this.id;
    }

    public getPersona(): Persona {
        return this.persona;
    }

    public getEspacioId(): string {
        return this.espacioId;
    }

    public getFechaInicio(): Date {
        return this.fechaInicio;
    }

    public getFechaFin(): Date {
        return this.fechaFin;
    }

    public getEstado(): string {
        return this.estado;
    }

    // Setters
    public setEstado(estado: string): void {
        this.estado = estado;
    }

    public cancelar(): void {
        this.estado = 'cancelada';
        console.log(`Reserva ${this.id} ha sido cancelada`);
    }
}
