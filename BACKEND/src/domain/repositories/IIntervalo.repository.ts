import { Intervalo } from '../Intervalo';

export interface IIntervaloRepository {
    create(intervalo: Intervalo): Promise<Intervalo>;
    findById(id: string): Promise<Intervalo | null>;
    findByEmpresa(id_empresa: string): Promise<Intervalo[]>;
    deleteByEmpresa(id_empresa: string): Promise<number>;
    createMany(intervalos: Intervalo[]): Promise<Intervalo[]>;
}
