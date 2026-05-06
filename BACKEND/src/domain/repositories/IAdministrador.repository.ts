import { Administrador } from '../Administrador';

export interface IAdministradorRepository {
    // CRUD operations
    create(administrador: Administrador): Promise<Administrador>;
    findById(id: string): Promise<Administrador | null>;
    findAll(): Promise<Administrador[]>;
    update(id: string, administrador: Partial<Administrador>): Promise<Administrador | null>;
    delete(id: string): Promise<boolean>;
    
    // Specific operations
    findByEmail(email: string): Promise<Administrador | null>;
    existsByEmail(email: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    hasPermission(id: string, permiso: string): Promise<boolean>;
}
