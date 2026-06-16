import axiosInstance from '../axios';

const empresasService = {
    // Crear empresa
    create: async (empresaData) => {
        try {
            const response = await axiosInstance.post('/empresas', empresaData);
            return response.data;
        } catch (error) {
            console.error('Error al crear empresa:', error);
            throw error;
        }
    },

    // Obtener todas las empresas
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/empresas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener empresas:', error);
            throw error;
        }
    },

    // Obtener empresa por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/empresas/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Obtener empresa por NIT
    getByNit: async (nit) => {
        try {
            const response = await axiosInstance.get(`/empresas/nit/${nit}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener empresa por NIT:', error);
            throw error;
        }
    },

    // Actualizar empresa
    update: async (id, empresaData) => {
        try {
            const response = await axiosInstance.put(`/empresas/${id}`, empresaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar empresa:', error);
            throw error;
        }
    },

    // Eliminar empresa
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/empresas/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar empresa:', error);
            throw error;
        }
    }
};

export default empresasService;
