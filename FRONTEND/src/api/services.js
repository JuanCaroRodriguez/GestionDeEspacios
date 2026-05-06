import axios from "./axios";

export const API_PROTOTYPES = Object.freeze({
  auth: Object.freeze({
    registerAdmin: async (newUser) => {
      try {
        const response = await axios.post(`/personas/register/admin`, newUser);
        return response.data;
      } catch (error) {
        console.error("Error en el registro de administrador:", error);
        throw error;
      }
    },
    registerEstudiante: async (newUser) => {
      try {
        const response = await axios.post(
          `/personas/register/estudiante`,
          newUser,
        );
        return response.data;
      } catch (error) {
        console.error("Error en el registro de estudiante:", error);
        throw error;
      }
    },
    registerDocente: async (newUser) => {
      try {
        const response = await axios.post(
          `/personas/register/docente`,
          newUser,
        );
        return response.data;
      } catch (error) {
        console.error("Error en el registro de docente:", error);
        throw error;
      }
    },
    login: async (user) => {
      try {
        console.log("Services - Sending login request with data:", user); // Debug services
        const response = await axios.post(`/auth/login`, user);
        console.log("Services - Login response:", response.data); // Debug response
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        console.log("Services - Error details:", error.response?.data); // Debug error details
        throw error;
      }
    },
    getAll: async () => {
      try {
        const response = await axios.get(`/personas/all`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener personas:", error);
        throw error;
      }
    },
    getProfile: async (id) => {
      try {
        const response = await axios.get(`/personas/profile/${id}`);
        return response.data;
      } catch (error) {
        console.error("Error al obtener perfil:", error);
        throw error;
      }
    },
    updateProfile: async (id, user) => {
      try {
        const response = await axios.put(`/personas/profile/${id}`, user);
        return response.data;
      } catch (error) {
        console.error("Error al actualizar perfil:", error);
        throw error;
      }
    },
  }),
  reservation: Object.freeze({
    get: async (userId) => {
      try {
        const response = await axios.get(`/reservations/?userId=${userId}`);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    getAll: async () => {
      try {
        const response = await axios.get(`/all-reservations`);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    post: async (reservation) => {
      try {
        const response = await axios.post(`/reservation`, reservation);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    put: async (reservation) => {
      try {
        const response = await axios.put(`/reservation`, reservation);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    delete: async (reservationId) => {
      try {
        const response = await axios.delete(`/reservation/${reservationId}`);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
  }),
});
