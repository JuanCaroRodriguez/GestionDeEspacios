import axios from "axios";

// Definir la URL base
const API = import.meta.env.VITE_BASE_URL;

// Crear una instancia de axios con la URL base y otras configuraciones
const axiosInstance = axios.create({
    baseURL: API,
});

export default axiosInstance;
