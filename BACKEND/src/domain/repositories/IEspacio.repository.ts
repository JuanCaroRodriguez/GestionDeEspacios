import { Espacio } from '../Espacio';

export interface IEspacioRepository {
    // CRUD operations
    create(espacio: Espacio): Promise<Espacio>;
    findById(id: string): Promise<Espacio | null>;
    findAll(): Promise<Espacio[]>;
    update(id: string, espacio: Partial<Espacio>): Promise<Espacio | null>;
    delete(id: string): Promise<boolean>;
    
    // Specific operations
    findByDisponible(disponible: boolean): Promise<Espacio[]>;
    findByTipo(tipo: string): Promise<Espacio[]>;
    findByUbicacion(ubicacion: string): Promise<Espacio[]>;
    existsById(id: string): Promise<boolean>;
    findAvailableByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Espacio[]>;
}
