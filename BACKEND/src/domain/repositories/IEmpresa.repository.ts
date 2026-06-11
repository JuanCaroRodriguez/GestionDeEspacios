import { Empresa } from '../Empresa';

export interface IEmpresaRepository {
    create(empresa: Empresa): Promise<Empresa>;
    findById(id: string): Promise<Empresa | null>;
    findByNit(nit: string): Promise<Empresa | null>;
    findAll(): Promise<Empresa[]>;
    update(id: string, data: Partial<Empresa>): Promise<Empresa | null>;
    delete(id: string): Promise<boolean>;
    existsById(id: string): Promise<boolean>;
    existsByNit(nit: string): Promise<boolean>;
}
