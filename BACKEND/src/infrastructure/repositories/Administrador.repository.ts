import { IAdministradorRepository } from '../../domain/repositories/IAdministrador.repository';
import { Administrador } from '../../domain/Administrador';
import { AdministradorModel, IAdministrador } from '../models/Administrador.model';

export class AdministradorRepository implements IAdministradorRepository {
    
    async create(administrador: Administrador): Promise<Administrador> {
        const administradorDoc = new AdministradorModel({
            id: administrador.getId(),
            nombre: administrador.getNombre(),
            email: administrador.getEmail(),
            contraseña: administrador.getContraseña(),
            permisos: ['evaluar_reservas_laboratorios']
        });
        
        const savedAdministrador = await administradorDoc.save();
        return this.mapToEntity(savedAdministrador);
    }

    async findById(id: string): Promise<Administrador | null> {
        const administradorDoc = await AdministradorModel.findOne({ id });
        return administradorDoc ? this.mapToEntity(administradorDoc) : null;
    }

    async findAll(): Promise<Administrador[]> {
        const administradores = await AdministradorModel.find();
        return administradores.map(administrador => this.mapToEntity(administrador));
    }

    async update(id: string, administradorData: Partial<Administrador>): Promise<Administrador | null> {
        const updatedAdministrador = await AdministradorModel.findOneAndUpdate(
            { id },
            administradorData,
            { new: true }
        );
        return updatedAdministrador ? this.mapToEntity(updatedAdministrador) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await AdministradorModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findByEmail(email: string): Promise<Administrador | null> {
        const administradorDoc = await AdministradorModel.findOne({ email });
        return administradorDoc ? this.mapToEntity(administradorDoc) : null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const administrador = await AdministradorModel.findOne({ email });
        return !!administrador;
    }

    async existsById(id: string): Promise<boolean> {
        const administrador = await AdministradorModel.findOne({ id });
        return !!administrador;
    }

    async hasPermission(id: string, permiso: string): Promise<boolean> {
        const administrador = await AdministradorModel.findOne({ id });
        return administrador ? administrador.permisos.includes(permiso) : false;
    }

    private mapToEntity(administradorDoc: IAdministrador): Administrador {
        const administrador = new Administrador(
            administradorDoc.id,
            administradorDoc.nombre,
            administradorDoc.email,
            administradorDoc.contraseña
        );
        return administrador;
    }
}
