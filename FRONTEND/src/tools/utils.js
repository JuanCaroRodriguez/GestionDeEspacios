export async function obtenerDeLocalStorage(clave) {
    try {
      const valor = localStorage.getItem(clave);
      if (valor !== null) {
        // Devolver el valor parseado
        return JSON.parse(valor);
      } else {
        return null; // No se encontró ningún valor para la clave
      }
    } catch (error) {
      console.error('Error al obtener de localStorage:', error);
      return null; // Error
    }
  }
  
  // Función para guardar datos en localStorage
  export async function guardarEnLocalStorage(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true; // Éxito
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return false; // Error
    }
  }