import { Bloque } from '../Bloque';

export interface IBloqueRepository {
    create(bloque: Bloque): Promise<Bloque>;
    findById(id: string): Promise<Bloque | null>;
    findByIdEmpresa(id_empresa: string): Promise<Bloque[]>;
    findAll(): Promise<Bloque[]>;
    update(id: string, data: Partial<Bloque>): Promise<Bloque | null>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    existsByNombreAndEmpresa(nombre: string, id_empresa: string): Promise<boolean>;
}
