import { ISuperAdminRepository } from "../../domain/repositories/ISuperAdmin.repository";
import { SuperAdmin } from "../../domain/SuperAdmin";
import { SuperAdminModel, ISuperAdmin } from "../models/SuperAdmin.model";

export class SuperAdminRepository implements ISuperAdminRepository {
  async create(superAdmin: SuperAdmin): Promise<SuperAdmin> {
    const superAdminDoc = new SuperAdminModel({
      id: superAdmin.getId(),
      nombre: superAdmin.getNombre(),
      email: superAdmin.getEmail(),
      contraseña: superAdmin.getContraseña(),
      permisos: [
        "crear_espacios",
        "eliminar_espacios",
        "modificar_espacios",
        "crear_usuarios",
        "eliminar_usuarios",
        "modificar_usuarios",
        "suspender_usuarios",
        "evaluar_reservas_laboratorios",
      ],
    });

    const savedSuperAdmin = await superAdminDoc.save();
    return this.mapToEntity(savedSuperAdmin);
  }

  async findById(id: string): Promise<SuperAdmin | null> {
    const superAdminDoc = await SuperAdminModel.findOne({ id });
    return superAdminDoc ? this.mapToEntity(superAdminDoc) : null;
  }

  async findAll(): Promise<SuperAdmin[]> {
    const superAdmins = await SuperAdminModel.find();
    return superAdmins.map((superAdmin) => this.mapToEntity(superAdmin));
  }

  async update(
    id: string,
    superAdminData: Partial<SuperAdmin>,
  ): Promise<SuperAdmin | null> {
    const updatedSuperAdmin = await SuperAdminModel.findOneAndUpdate(
      { id },
      superAdminData,
      { new: true },
    );
    return updatedSuperAdmin ? this.mapToEntity(updatedSuperAdmin) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await SuperAdminModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async findByEmail(email: string): Promise<SuperAdmin | null> {
    const superAdminDoc = await SuperAdminModel.findOne({ email });
    return superAdminDoc ? this.mapToEntity(superAdminDoc) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const superAdmin = await SuperAdminModel.findOne({ email });
    return !!superAdmin;
  }

  async existsById(id: string): Promise<boolean> {
    const superAdmin = await SuperAdminModel.findOne({ id });
    return !!superAdmin;
  }

  async hasPermission(id: string, permiso: string): Promise<boolean> {
    const superAdmin = await SuperAdminModel.findOne({ id });
    return superAdmin ? superAdmin.permisos.includes(permiso) : false;
  }

  private mapToEntity(superAdminDoc: ISuperAdmin): SuperAdmin {
    const superAdmin = new SuperAdmin(
      superAdminDoc.id,
      superAdminDoc.nombre,
      superAdminDoc.email,
      superAdminDoc.contraseña,
    );
    return superAdmin;
  }
}
