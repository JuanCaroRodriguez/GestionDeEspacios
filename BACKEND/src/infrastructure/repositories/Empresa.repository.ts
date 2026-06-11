import { Empresa } from '../../domain/Empresa';
import { IEmpresaRepository } from '../../domain/repositories/IEmpresa.repository';
import { EmpresaModel, IEmpresa } from '../models/Empresa.model';

export class EmpresaRepository implements IEmpresaRepository {
    
    async create(empresa: Empresa): Promise<Empresa> {
        const empresaDoc = new EmpresaModel({
            id: empresa.getId(),
            nombre: empresa.getNombre(),
            nit: empresa.getNit()
        });
        
        const savedEmpresa = await empresaDoc.save();
        return await this.mapToEntity(savedEmpresa);
    }

    async findById(id: string): Promise<Empresa | null> {
        const empresaDoc = await EmpresaModel.findOne({ id });
        return empresaDoc ? await this.mapToEntity(empresaDoc) : null;
    }

    async findByNit(nit: string): Promise<Empresa | null> {
        const empresaDoc = await EmpresaModel.findOne({ nit });
        return empresaDoc ? await this.mapToEntity(empresaDoc) : null;
    }

    async findAll(): Promise<Empresa[]> {
        const empresaDocs = await EmpresaModel.find().sort({ createdAt: -1 });
        return await Promise.all(empresaDocs.map(doc => this.mapToEntity(doc)));
    }

    async update(id: string, data: Partial<Empresa>): Promise<Empresa | null> {
        const updateData: any = {};
        
        if (data.getNombre && data.getNombre()) {
            updateData.nombre = data.getNombre();
        }
        if (data.getNit && data.getNit()) {
            updateData.nit = data.getNit();
        }

        const empresaDoc = await EmpresaModel.findOneAndUpdate(
            { id },
            updateData,
            { new: true, runValidators: true }
        );

        return empresaDoc ? await this.mapToEntity(empresaDoc) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await EmpresaModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async existsById(id: string): Promise<boolean> {
        const exists = await EmpresaModel.exists({ id });
        return exists !== null;
    }

    async existsByNit(nit: string): Promise<boolean> {
        const exists = await EmpresaModel.exists({ nit });
        return exists !== null;
    }

    private async mapToEntity(empresaDoc: IEmpresa): Promise<Empresa> {
        const empresa = new Empresa(
            empresaDoc.id,
            empresaDoc.nombre,
            empresaDoc.nit
        );
        
        // Mantener las fechas originales
        (empresa as any).createdAt = empresaDoc.createdAt;
        (empresa as any).updatedAt = empresaDoc.updatedAt;
        
        return empresa;
    }
}
