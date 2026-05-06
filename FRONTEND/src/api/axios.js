import axios from "axios";

// Definir la URL base del backend
const API = "http://localhost:3001/api";

// Crear una instancia de axios con la URL base y otras configuraciones
const axiosInstance = axios.create({
  baseURL: API,
});

export default axiosInstance;
