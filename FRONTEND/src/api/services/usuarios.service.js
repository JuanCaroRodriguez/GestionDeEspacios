import axiosInstance from "../axios";

export const usuariosService = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/usuarios");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      throw error;
    }
  },

  // Obtener usuario por email
  getByEmail: async (email) => {
    try {
      const response = await axiosInstance.get(`/usuarios/email/${email}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuario por email:", error);
      throw error;
    }
  },

  // Crear nuevo usuario (solo SuperAdmin)
  create: async (usuarioData) => {
    try {
      const response = await axiosInstance.post(
        "/superadmin/usuarios",
        usuarioData,
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  },

  // Actualizar usuario
  update: async (id, usuarioData) => {
    try {
      // Enviar contraseña como texto plano - el backend se encarga del hashing
      if (usuarioData.contraseña) {
        console.log("Contraseña proporcionada para hashing en backend");
      }

      const response = await axiosInstance.put(`/usuarios/${id}`, usuarioData);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  },

  // Eliminar usuario (solo SuperAdmin)
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/superadmin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw error;
    }
  },

  // Suspender/Activar usuario (solo SuperAdmin)
  toggleEstado: async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/superadmin/usuarios/${id}/toggle-estado`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      throw error;
    }
  },

  // Filtrar usuarios por tipo
  getByTipo: async (tipo) => {
    try {
      const response = await axiosInstance.get(`/usuarios/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error("Error al filtrar usuarios por tipo:", error);
      throw error;
    }
  },

  // Obtener solo usuarios activos
  getActivos: async () => {
    try {
      const response = await axiosInstance.get("/usuarios/activos");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios activos:", error);
      throw error;
    }
  },

  // Obtener solo usuarios inactivos
  getInactivos: async () => {
    try {
      const response = await axiosInstance.get("/usuarios/inactivos");
      return response.data;
    } catch (error) {
      console.error("Error al obtener usuarios inactivos:", error);
      throw error;
    }
  },
};

export default usuariosService;
