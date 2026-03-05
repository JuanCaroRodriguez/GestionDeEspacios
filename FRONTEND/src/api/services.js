import axios from "./axios";

export const API_PROTOTYPES = Object.freeze({
  auth: Object.freeze({
    register: async (newUser) => {
      try {
        const response = await axios.post(`/user`, newUser);
        return response.data;
      } catch (error) {
        console.error("Error en el registro:", error);
        throw error;
      }
    },
    login: async (user) => {
      try {
        const response = await axios.post(`/login`, user);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    getAll: async () => {
      try {
        const response = await axios.get(`/users`);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    logout: async () => {
      try {
        const response = await axios.get(`/logout`);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        throw error;
      }
    },
    verify: async () => {
      try {
        const response = await axios.get(`/verify`);
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
    update: async (user) => {
      try {
        const response = await axios.put(`/user`, user);
        return response.data;
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
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
