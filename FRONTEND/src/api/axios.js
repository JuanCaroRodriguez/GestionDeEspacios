import axios from "axios";

// Definir la URL base del backend desde el .env de Vite
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
const API = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;

// Crear una instancia de axios con la URL base y otras configuraciones
const axiosInstance = axios.create({
  baseURL: API,
});

// Interceptor de respuesta: si el token expiró (401) redirigir al login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
