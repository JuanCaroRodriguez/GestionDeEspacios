import { SuperAdmin } from '../SuperAdmin';

export interface ISuperAdminRepository {
    // CRUD operations
    create(superAdmin: SuperAdmin): Promise<SuperAdmin>;
    findById(id: string): Promise<SuperAdmin | null>;
    findAll(): Promise<SuperAdmin[]>;
    update(id: string, superAdmin: Partial<SuperAdmin>): Promise<SuperAdmin | null>;
    delete(id: string): Promise<boolean>;
    
    // Specific operations
    findByEmail(email: string): Promise<SuperAdmin | null>;
    existsByEmail(email: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    hasPermission(id: string, permiso: string): Promise<boolean>;
}
