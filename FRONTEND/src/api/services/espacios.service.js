import axiosInstance from '../axios';

export const espaciosService = {
    // Obtener todos los espacios
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/espacios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener espacios:', error);
            throw error;
        }
    },

    // Obtener espacio por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/espacios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener espacio:', error);
            throw error;
        }
    },

    // Crear nuevo espacio
    create: async (espacioData) => {
        try {
            const response = await axiosInstance.post('/superadmin/espacios', espacioData);
            return response.data;
        } catch (error) {
            console.error('Error al crear espacio:', error);
            throw error;
        }
    },

    // Actualizar espacio
    update: async (id, espacioData) => {
        try {
            const response = await axiosInstance.put(`/espacios/${id}`, espacioData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar espacio:', error);
            throw error;
        }
    },

    // Eliminar espacio
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/superadmin/espacios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar espacio:', error);
            throw error;
        }
    },

    // Cambiar disponibilidad de espacio
    toggleDisponibilidad: async (id) => {
        try {
            const response = await axiosInstance.patch(`/espacios/${id}/toggle-disponibilidad`);
            return response.data;
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            throw error;
        }
    },

    // Obtener espacios disponibles
    getDisponibles: async () => {
        try {
            const response = await axiosInstance.get('/espacios/disponibles');
            return response.data;
        } catch (error) {
            console.error('Error al obtener espacios disponibles:', error);
            throw error;
        }
    },

    // Filtrar espacios por tipo
    getByTipo: async (tipo) => {
        try {
            const response = await axiosInstance.get(`/espacios/tipo/${tipo}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar espacios por tipo:', error);
            throw error;
        }
    },

    // Filtrar espacios por ubicación
    getByUbicacion: async (ubicacion) => {
        try {
            const response = await axiosInstance.get(`/espacios/ubicacion/${ubicacion}`);
            return response.data;
        } catch (error) {
            console.error('Error al filtrar espacios por ubicación:', error);
            throw error;
        }
    }
};

export default espaciosService;
