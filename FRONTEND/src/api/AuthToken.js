import { obtenerDeLocalStorage } from "../tools/utils";
import axiosInstance from "./axios";

// Interceptor registrado UNA vez al cargar el módulo.
// Lee el token de localStorage sincrónicamente en cada petición.
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("session");
      const session = raw ? JSON.parse(raw) : null;
      if (session?.token) {
        config.headers["Authorization"] = session.token;
      }
    } catch {
      /* localStorage no disponible (SSR/test) */
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// AuthToken sigue disponible para la verificación de sesión en SessionState
const AuthToken = async () => {
  const session = await obtenerDeLocalStorage("session");
  return session;
};

export default AuthToken;
