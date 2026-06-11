import { Bloque } from '../../domain/Bloque';
import { IBloqueRepository } from '../../domain/repositories/IBloque.repository';
import { BloqueModel, IBloque } from '../models/Bloque.model';

export class BloqueRepository implements IBloqueRepository {
    
    async create(bloque: Bloque): Promise<Bloque> {
        const bloqueDoc = new BloqueModel({
            id: bloque.getId(),
            nombre: bloque.getNombre(),
            id_empresa: bloque.getIdEmpresa(),
            pisos: bloque.getPisos()
        });
        
        const savedBloque = await bloqueDoc.save();
        return await this.mapToEntity(savedBloque);
    }

    async findById(id: string): Promise<Bloque | null> {
        const bloqueDoc = await BloqueModel.findOne({ id });
        return bloqueDoc ? await this.mapToEntity(bloqueDoc) : null;
    }

    async findByIdEmpresa(id_empresa: string): Promise<Bloque[]> {
        const bloqueDocs = await BloqueModel.find({ id_empresa }).sort({ nombre: 1 });
        return await Promise.all(bloqueDocs.map(doc => this.mapToEntity(doc)));
    }

    async findAll(): Promise<Bloque[]> {
        const bloqueDocs = await BloqueModel.find().sort({ nombre: 1 });
        return await Promise.all(bloqueDocs.map(doc => this.mapToEntity(doc)));
    }

    async update(id: string, data: Partial<Bloque>): Promise<Bloque | null> {
        const updateData: any = {};
        
        if (data.getNombre) {
            updateData.nombre = data.getNombre();
        }
        if (data.getIdEmpresa) {
            updateData.id_empresa = data.getIdEmpresa();
        }
        if (data.getPisos) {
            updateData.pisos = data.getPisos();
        }

        const bloqueDoc = await BloqueModel.findOneAndUpdate(
            { id },
            updateData,
            { new: true, runValidators: true }
        );

        return bloqueDoc ? await this.mapToEntity(bloqueDoc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await BloqueModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async existsById(id: string): Promise<boolean> {
        const exists = await BloqueModel.exists({ id });
        return exists !== null;
    }

    async existsByNombreAndEmpresa(nombre: string, id_empresa: string): Promise<boolean> {
        const exists = await BloqueModel.exists({ nombre, id_empresa });
        return exists !== null;
    }

    private async mapToEntity(bloqueDoc: IBloque): Promise<Bloque> {
        const bloque = new Bloque(
            bloqueDoc.id,
            bloqueDoc.nombre,
            bloqueDoc.id_empresa
        );
        
        // Mapear pisos
        const pisos = bloqueDoc.pisos.map(piso => ({
            numero: piso.numero,
            cantidadSalones: piso.cantidadSalones,
            salones: piso.salones.map(salon => ({
                numero: salon.numero,
                nombre: salon.nombre
            }))
        }));
        
        // Establecer pisos directamente (necesitamos acceso privado)
        (bloque as any).pisos = pisos;
        
        // Mantener las fechas originales
        (bloque as any).createdAt = bloqueDoc.createdAt;
        (bloque as any).updatedAt = bloqueDoc.updatedAt;
        
        return bloque;
    }
}
