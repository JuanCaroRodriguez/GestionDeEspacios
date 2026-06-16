import { DepartamentoRepository } from "../repositories/departamentos.repository";
import { IDepartamento } from "../infrastructure/models/Departamento.model";
import { EmpresaModel } from "../infrastructure/models/Empresa.model";

export class DepartamentoService {
  private departamentoRepository: DepartamentoRepository;

  constructor() {
    this.departamentoRepository = new DepartamentoRepository();
  }

  async createDepartamento(
    departamentoData: Partial<IDepartamento>,
  ): Promise<IDepartamento> {
    // Si el id_empresa es 'temp', omitir validación (para creación temporal)
    if (departamentoData.id_empresa !== "temp") {
      // Validar que la empresa exista
      const empresa = await EmpresaModel.findOne({
        id: departamentoData.id_empresa,
      });
      if (!empresa) {
        throw new Error("La empresa especificada no existe");
      }
    }

    // Verificar que no exista un departamento con el mismo nombre en la empresa
    const existing = await this.departamentoRepository.findByNombre(
      departamentoData.nombre!,
      departamentoData.id_empresa,
    );
    if (existing) {
      throw new Error("Ya existe un departamento con ese nombre en la empresa");
    }

    // Generar ID único si no se proporciona
    if (!departamentoData.id) {
      departamentoData.id = `dept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return await this.departamentoRepository.create(departamentoData);
  }

  async getDepartamentoById(id: string): Promise<IDepartamento | null> {
    return await this.departamentoRepository.findById(id);
  }

  async getDepartamentosByEmpresa(
    id_empresa: string,
  ): Promise<IDepartamento[]> {
    // Validar que la empresa exista
    const empresa = await EmpresaModel.findOne({ id: id_empresa });
    if (!empresa) {
      throw new Error("La empresa especificada no existe");
    }

    return await this.departamentoRepository.findByEmpresa(id_empresa);
  }

  async updateDepartamento(
    id: string,
    updateData: Partial<IDepartamento>,
  ): Promise<IDepartamento | null> {
    const departamento = await this.departamentoRepository.findById(id);
    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    // Si se actualiza el nombre, verificar que no exista otro con el mismo nombre
    if (updateData.nombre && updateData.nombre !== departamento.nombre) {
      const empresaId = updateData.id_empresa || departamento.id_empresa;
      const existing = await this.departamentoRepository.findByNombre(
        updateData.nombre,
        empresaId,
      );
      if (existing) {
        throw new Error(
          "Ya existe un departamento con ese nombre en la empresa",
        );
      }
    }

    return await this.departamentoRepository.update(id, updateData);
  }

  async deleteDepartamento(id: string): Promise<boolean> {
    const departamento = await this.departamentoRepository.findById(id);
    if (!departamento) {
      throw new Error("Departamento no encontrado");
    }

    return await this.departamentoRepository.delete(id);
  }

  async departamentoExists(id: string): Promise<boolean> {
    return await this.departamentoRepository.exists(id);
  }

  async updateDepartamentosEmpresa(
    tempId: string,
    realId: string,
  ): Promise<void> {
    await this.departamentoRepository.updateManyByEmpresa(tempId, realId);
  }
}
