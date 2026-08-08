import { Intervalo } from '../../domain/Intervalo';
import { IIntervaloRepository } from '../../domain/repositories/IIntervalo.repository';
import { IntervaloModel, IIntervalo } from '../models/Intervalo.model';

export class IntervaloRepository implements IIntervaloRepository {

    async create(intervalo: Intervalo): Promise<Intervalo> {
        const doc = new IntervaloModel({
            id: intervalo.getId(),
            id_empresa: intervalo.getIdEmpresa(),
            hora_inicio: intervalo.getHoraInicio(),
            hora_fin: intervalo.getHoraFin(),
            orden: intervalo.getOrden(),
            activo: intervalo.getActivo()
        });
        const saved = await doc.save();
        return this.mapToEntity(saved);
    }

    async findById(id: string): Promise<Intervalo | null> {
        const doc = await IntervaloModel.findOne({ id });
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByEmpresa(id_empresa: string): Promise<Intervalo[]> {
        const docs = await IntervaloModel
            .find({ id_empresa, activo: true })
            .sort({ orden: 1 });
        return docs.map(d => this.mapToEntity(d));
    }

    async deleteByEmpresa(id_empresa: string): Promise<number> {
        const result = await IntervaloModel.deleteMany({ id_empresa });
        return result.deletedCount ?? 0;
    }

    async createMany(intervalos: Intervalo[]): Promise<Intervalo[]> {
        const docs = intervalos.map(i => ({
            id: i.getId(),
            id_empresa: i.getIdEmpresa(),
            hora_inicio: i.getHoraInicio(),
            hora_fin: i.getHoraFin(),
            orden: i.getOrden(),
            activo: i.getActivo()
        }));
        const saved = await IntervaloModel.insertMany(docs);
        return (saved as unknown as IIntervalo[]).map(d => this.mapToEntity(d));
    }

    private mapToEntity(doc: IIntervalo): Intervalo {
        const intervalo = new Intervalo(
            doc.id,
            doc.id_empresa,
            doc.hora_inicio,
            doc.hora_fin,
            doc.orden,
            doc.activo
        );
        (intervalo as any).createdAt = doc.createdAt;
        (intervalo as any).updatedAt = doc.updatedAt;
        return intervalo;
    }
}
