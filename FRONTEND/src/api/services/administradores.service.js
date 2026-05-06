import axiosInstance from "../axios";

export const administradoresService = {
  // Obtener todos los administradores
  getAll: async () => {
    try {
      const response = await axiosInstance.get("/administrador");
      return response.data;
    } catch (error) {
      console.error("Error al obtener administradores:", error);
      throw error;
    }
  },

  // Obtener administrador por ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/administrador/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener administrador:", error);
      throw error;
    }
  },

  // Obtener administrador por email
  getByEmail: async (email) => {
    try {
      const response = await axiosInstance.get(`/administrador/email/${email}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener administrador por email:", error);
      throw error;
    }
  },

  // Crear nuevo administrador (solo SuperAdmin)
  create: async (administradorData) => {
    try {
      const response = await axiosInstance.post(
        "/superadmin/administradores",
        administradorData,
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear administrador:", error);
      throw error;
    }
  },

  // Actualizar administrador
  update: async (id, administradorData) => {
    try {
      const response = await axiosInstance.put(
        `/administrador/${id}`,
        administradorData,
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar administrador:", error);
      throw error;
    }
  },

  // Eliminar administrador (solo SuperAdmin)
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/superadmin/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar administrador:", error);
      throw error;
    }
  },

  // Evaluar solicitud de reserva de laboratorio
  evaluarReservaLaboratorio: async (evaluacionData) => {
    try {
      const response = await axiosInstance.post(
        "/administrador/evaluar-reserva-laboratorio",
        evaluacionData,
      );
      return response.data;
    } catch (error) {
      console.error("Error al evaluar reserva de laboratorio:", error);
      throw error;
    }
  },

  // Obtener reservas pendientes de evaluación
  getReservasPendientes: async () => {
    try {
      const response = await axiosInstance.get(
        "/administrador/reservas-pendientes",
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas pendientes:", error);
      throw error;
    }
  },

  // Obtener historial de evaluaciones
  getHistorialEvaluaciones: async () => {
    try {
      const response = await axiosInstance.get(
        "/administrador/historial-evaluaciones",
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial de evaluaciones:", error);
      throw error;
    }
  },
};

export default administradoresService;
