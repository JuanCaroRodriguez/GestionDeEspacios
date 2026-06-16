import axios from "axios";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3001";

export interface Departamento {
  id: string;
  nombre: string;
  id_empresa: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartamentoRequest {
  nombre: string;
  id_empresa: string;
}

export const departamentosService = {
  // Crear departamento
  async create(departamento: CreateDepartamentoRequest): Promise<Departamento> {
    const response = await axios.post(
      `${API_URL}/api/departamentos`,
      departamento,
    );
    return response.data.data;
  },

  // Obtener departamento por ID
  async getById(id: string): Promise<Departamento> {
    const response = await axios.get(`${API_URL}/api/departamentos/${id}`);
    return response.data.data;
  },

  // Obtener departamentos por empresa
  async getByEmpresa(id_empresa: string): Promise<Departamento[]> {
    const response = await axios.get(
      `${API_URL}/api/departamentos/empresa/${id_empresa}`,
    );
    return response.data.data;
  },

  // Actualizar departamento
  async update(id: string, nombre: string): Promise<Departamento> {
    const response = await axios.put(`${API_URL}/api/departamentos/${id}`, {
      nombre,
    });
    return response.data.data;
  },

  // Eliminar departamento
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/departamentos/${id}`);
  },

  // Actualizar departamentos por empresa (de temp a real)
  async updateByEmpresa(tempId: string, realId: string): Promise<void> {
    await axios.put(`${API_URL}/api/departamentos/update-by-empresa`, {
      tempId,
      realId,
    });
  },
};
