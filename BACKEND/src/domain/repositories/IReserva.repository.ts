import { Reserva } from '../Reserva';

export interface IReservaRepository {
    // CRUD operations
    create(reserva: Reserva): Promise<Reserva>;
    findById(id: string): Promise<Reserva | null>;
    findAll(): Promise<Reserva[]>;
    update(id: string, reserva: Partial<Reserva>): Promise<Reserva | null>;
    delete(id: string): Promise<boolean>;
    
    // Specific operations
    findByPersonaId(personaId: string): Promise<Reserva[]>;
    findByEspacioId(espacioId: string): Promise<Reserva[]>;
    findByEstado(estado: string): Promise<Reserva[]>;
    findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Reserva[]>;
    findActiveReservas(): Promise<Reserva[]>;
    findReservasByEspacioAndDateRange(espacioId: string, fechaInicio: Date, fechaFin: Date): Promise<Reserva[]>;
    existsById(id: string): Promise<boolean>;
    cancelReserva(id: string): Promise<boolean>;
}
