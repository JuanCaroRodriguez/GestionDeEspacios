import { obtenerDeLocalStorage } from '../tools/utils';
import axiosInstance from './axios';

let requestInterceptorId = null;

const AuthToken = async () => {
    const session = await obtenerDeLocalStorage('session');
    // Si hay un token, agrega el interceptor de solicitud
    if (session) {
        // Agregar interceptor de solicitud
        requestInterceptorId = axiosInstance.interceptors.request.use(
            config => {
                config.headers['Authorization'] = session.token;
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
    } else {
        // Si no hay token, eliminar el interceptor de solicitud si existe
        if (requestInterceptorId !== null) {
            axiosInstance.interceptors.request.eject(requestInterceptorId);
            requestInterceptorId = null;
        }
    }

    return session;
}

export default AuthToken;
