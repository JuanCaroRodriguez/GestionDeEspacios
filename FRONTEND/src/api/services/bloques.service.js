import axiosInstance from '../axios';

const bloquesService = {
    // Crear bloque
    create: async (bloqueData) => {
        try {
            const response = await axiosInstance.post('/bloques', bloqueData);
            return response.data;
        } catch (error) {
            console.error('Error al crear bloque:', error);
            throw error;
        }
    },

    // Obtener todos los bloques
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/bloques');
            return response.data;
        } catch (error) {
            console.error('Error al obtener bloques:', error);
            throw error;
        }
    },

    // Obtener bloques por empresa
    getByIdEmpresa: async (id_empresa) => {
        try {
            const response = await axiosInstance.get(`/bloques/empresa/${id_empresa}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener bloques de la empresa:', error);
            throw error;
        }
    },

    // Obtener bloque por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/bloques/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener bloque:', error);
            throw error;
        }
    },

    // Actualizar bloque
    update: async (id, bloqueData) => {
        try {
            const response = await axiosInstance.put(`/bloques/${id}`, bloqueData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar bloque:', error);
            throw error;
        }
    },

    // Eliminar bloque
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/bloques/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar bloque:', error);
            throw error;
        }
    },

    // Añadir piso a un bloque
    addPiso: async (id, pisoData) => {
        try {
            const response = await axiosInstance.post(`/bloques/${id}/pisos`, pisoData);
            return response.data;
        } catch (error) {
            console.error('Error al añadir piso:', error);
            throw error;
        }
    },

    // Eliminar piso de un bloque
    removePiso: async (id, numeroPiso) => {
        try {
            const response = await axiosInstance.delete(`/bloques/${id}/pisos/${numeroPiso}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar piso:', error);
            throw error;
        }
    },

    // Actualizar piso de un bloque
    updatePiso: async (id, numeroPiso, pisoData) => {
        try {
            const response = await axiosInstance.put(`/bloques/${id}/pisos/${numeroPiso}`, pisoData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar piso:', error);
            throw error;
        }
    }
};

export default bloquesService;
