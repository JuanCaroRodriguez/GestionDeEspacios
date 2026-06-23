import { DepartamentoModel, IDepartamento } from "../models/Departamento.model";

export class DepartamentoRepository {
  async create(
    departamentoData: Partial<IDepartamento>,
  ): Promise<IDepartamento> {
    const departamento = new DepartamentoModel(departamentoData);
    return await departamento.save();
  }

  async findById(id: string): Promise<IDepartamento | null> {
    return await DepartamentoModel.findOne({ id });
  }

  async findByEmpresa(id_empresa: string): Promise<IDepartamento[]> {
    return await DepartamentoModel.find({ id_empresa }).sort({ nombre: 1 });
  }

  async update(
    id: string,
    updateData: Partial<IDepartamento>,
  ): Promise<IDepartamento | null> {
    return await DepartamentoModel.findOneAndUpdate({ id }, updateData, {
      new: true,
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await DepartamentoModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async exists(id: string): Promise<boolean> {
    const count = await DepartamentoModel.countDocuments({ id });
    return count > 0;
  }

  async findByNombre(
    nombre: string,
    id_empresa: string,
  ): Promise<IDepartamento | null> {
    return await DepartamentoModel.findOne({ nombre, id_empresa });
  }

  async updateManyByEmpresa(tempId: string, realId: string): Promise<void> {
    await DepartamentoModel.updateMany(
      { id_empresa: tempId },
      { id_empresa: realId },
    );
  }
}
