import axiosInstance from '../axios';

const intervalosService = {
    /**
     * Obtiene las franjas horarias activas de una empresa ordenadas por 'orden'.
     * GET /api/empresas/:idEmpresa/intervalos
     */
    async getByEmpresa(idEmpresa) {
        const response = await axiosInstance.get(`/empresas/${idEmpresa}/intervalos`);
        return response.data;
    },

    /**
     * Reemplaza toda la configuración de franjas horarias de una empresa.
     * Requiere rol superadmin.
     * PUT /api/empresas/:idEmpresa/intervalos
     * @param {string} idEmpresa
     * @param {{ hora_inicio: string, hora_fin: string }[]} intervalos
     */
    async guardar(idEmpresa, intervalos) {
        const response = await axiosInstance.put(
            `/empresas/${idEmpresa}/intervalos`,
            { intervalos }
        );
        return response.data;
    },

    /**
     * Convierte "HH:MM" (24h) a "HH:MM AM/PM" para mostrar en la UI.
     */
    formatearHora(hora24) {
        if (!hora24) return hora24;
        const [h, m] = hora24.split(':').map(Number);
        const periodo = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${periodo}`;
    },

    /**
     * Convierte un intervalo { hora_inicio, hora_fin } a la cadena de display
     * "07:00 AM - 07:50 AM".
     */
    formatearIntervalo(intervalo) {
        return `${this.formatearHora(intervalo.hora_inicio)} - ${this.formatearHora(intervalo.hora_fin)}`;
    },

    /**
     * Genera el string de slot interno (24h) usado como clave para la tabla.
     * "07:00 - 07:50"
     */
    slotKey(intervalo) {
        return `${intervalo.hora_inicio} - ${intervalo.hora_fin}`;
    },

    /**
     * Validación de superposición en frontend para retroalimentación inmediata.
     * Dos intervalos se superponen cuando:  a.inicio < b.fin  AND  a.fin > b.inicio
     */
    haySuperposicion(a, b) {
        const toMin = (h) => {
            const [hh, mm] = h.split(':').map(Number);
            return hh * 60 + mm;
        };
        return toMin(a.hora_inicio) < toMin(b.hora_fin) &&
               toMin(a.hora_fin)   > toMin(b.hora_inicio);
    },

    /**
     * Valida una lista de intervalos en frontend.
     * Retorna null si es válida, o el mensaje de error si no lo es.
     */
    validarIntervalos(intervalos) {
        const toMin = (h) => {
            const [hh, mm] = h.split(':').map(Number);
            return hh * 60 + mm;
        };
        const reHora = /^\d{2}:\d{2}$/;

        if (!intervalos || intervalos.length === 0) {
            return 'Debe agregar al menos una franja horaria.';
        }

        for (const iv of intervalos) {
            if (!reHora.test(iv.hora_inicio) || !reHora.test(iv.hora_fin)) {
                return `Formato de hora inválido en "${iv.hora_inicio} - ${iv.hora_fin}". Use HH:MM.`;
            }
            const ini = toMin(iv.hora_inicio);
            const fin = toMin(iv.hora_fin);
            if (ini === fin) return `La franja ${iv.hora_inicio} - ${iv.hora_fin} tiene duración cero.`;
            if (ini > fin)  return `La hora inicial debe ser menor que la final: ${iv.hora_inicio} - ${iv.hora_fin}.`;
        }

        const sorted = [...intervalos].sort((a, b) => toMin(a.hora_inicio) - toMin(b.hora_inicio));
        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];
            if (toMin(curr.hora_inicio) < toMin(prev.hora_fin)) {
                return `La franja ${curr.hora_inicio} - ${curr.hora_fin} se superpone con ${prev.hora_inicio} - ${prev.hora_fin}.`;
            }
        }
        return null;
    },

    /**
     * Genera intervalos regulares entre horaInicio y horaFin con duracionMin minutos.
     */
    generarIntervalosRegulares(horaInicio, horaFin, duracionMin) {
        const toMin = (h) => { const [hh, mm] = h.split(':').map(Number); return hh * 60 + mm; };
        const toHora = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        const ini = toMin(horaInicio);
        const fin = toMin(horaFin);
        const result = [];
        let cur = ini;
        while (cur + duracionMin <= fin) {
            result.push({ hora_inicio: toHora(cur), hora_fin: toHora(cur + duracionMin) });
            cur += duracionMin;
        }
        return result;
    }
};

export default intervalosService;
