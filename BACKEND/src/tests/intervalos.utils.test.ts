import {
    horaAMinutos,
    esHoraValida,
    haySuperposicion,
    validarIntervalos,
    generarIntervalosRegulares,
    minutosAHora,
    IntervaloInput
} from '../infrastructure/utils/intervalos.utils';

// ─── horaAMinutos ─────────────────────────────────────────────────────────────

describe('horaAMinutos', () => {
    it('convierte 07:00 a 420', () => expect(horaAMinutos('07:00')).toBe(420));
    it('convierte 07:50 a 470', () => expect(horaAMinutos('07:50')).toBe(470));
    it('convierte 13:30 a 810', () => expect(horaAMinutos('13:30')).toBe(810));
    it('convierte 00:00 a 0',   () => expect(horaAMinutos('00:00')).toBe(0));
});

// ─── esHoraValida ─────────────────────────────────────────────────────────────

describe('esHoraValida', () => {
    it('acepta 07:00', () => expect(esHoraValida('07:00')).toBe(true));
    it('acepta 23:59', () => expect(esHoraValida('23:59')).toBe(true));
    it('rechaza 7:00',  () => expect(esHoraValida('7:00')).toBe(false));
    it('rechaza 07:00AM', () => expect(esHoraValida('07:00AM')).toBe(false));
    it('rechaza cadena vacía', () => expect(esHoraValida('')).toBe(false));
});

// ─── haySuperposicion ─────────────────────────────────────────────────────────

describe('haySuperposicion', () => {
    const base: IntervaloInput = { hora_inicio: '07:00', hora_fin: '08:00' };

    it('✅ 07:00-08:00 + 08:00-09:00 NO se superponen', () => {
        expect(haySuperposicion(base, { hora_inicio: '08:00', hora_fin: '09:00' })).toBe(false);
    });

    it('❌ 07:00-08:00 + 07:30-08:30 se superponen', () => {
        expect(haySuperposicion(base, { hora_inicio: '07:30', hora_fin: '08:30' })).toBe(true);
    });

    it('❌ 07:00-08:00 + 06:30-07:30 se superponen', () => {
        expect(haySuperposicion(base, { hora_inicio: '06:30', hora_fin: '07:30' })).toBe(true);
    });

    it('❌ 07:00-08:00 + 07:15-07:45 (contenido) se superponen', () => {
        expect(haySuperposicion(base, { hora_inicio: '07:15', hora_fin: '07:45' })).toBe(true);
    });

    it('❌ 07:00-08:00 + 06:00-09:00 (envolvente) se superponen', () => {
        expect(haySuperposicion(base, { hora_inicio: '06:00', hora_fin: '09:00' })).toBe(true);
    });

    it('❌ 07:00-08:00 + 07:00-08:00 duplicado se superpone', () => {
        expect(haySuperposicion(base, { hora_inicio: '07:00', hora_fin: '08:00' })).toBe(true);
    });
});

// ─── validarIntervalos ────────────────────────────────────────────────────────

describe('validarIntervalos', () => {
    it('✅ lista válida no lanza error', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '07:00', hora_fin: '08:00' },
            { hora_inicio: '08:00', hora_fin: '09:00' }
        ])).not.toThrow();
    });

    it('❌ lista vacía lanza error', () => {
        expect(() => validarIntervalos([])).toThrow('al menos una franja horaria');
    });

    it('❌ 08:00-07:00 hora inicial mayor a final', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '08:00', hora_fin: '07:00' }
        ])).toThrow('La hora inicial');
    });

    it('❌ 08:00-08:00 duración cero', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '08:00', hora_fin: '08:00' }
        ])).toThrow('duración cero');
    });

    it('❌ 07:00-08:00 + 07:30-08:30 superposición', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '07:00', hora_fin: '08:00' },
            { hora_inicio: '07:30', hora_fin: '08:30' }
        ])).toThrow('superpone');
    });

    it('❌ duplicados exactos son superposición', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '07:00', hora_fin: '08:00' },
            { hora_inicio: '07:00', hora_fin: '08:00' }
        ])).toThrow('superpone');
    });

    it('❌ formato inválido de hora', () => {
        expect(() => validarIntervalos([
            { hora_inicio: '7:00', hora_fin: '08:00' }
        ])).toThrow('Formato de hora inválido');
    });

    it('✅ Empresa A puede tener intervalos diferentes a Empresa B (sin dependencia global)', () => {
        const empresaA = [
            { hora_inicio: '07:00', hora_fin: '07:50' },
            { hora_inicio: '07:50', hora_fin: '08:40' }
        ];
        const empresaB = [
            { hora_inicio: '08:00', hora_fin: '09:00' },
            { hora_inicio: '09:00', hora_fin: '10:00' }
        ];
        expect(() => validarIntervalos(empresaA)).not.toThrow();
        expect(() => validarIntervalos(empresaB)).not.toThrow();
    });
});

// ─── generarIntervalosRegulares ───────────────────────────────────────────────

describe('generarIntervalosRegulares', () => {
    it('genera franjas de 50 min entre 07:00 y 12:00', () => {
        const result = generarIntervalosRegulares('07:00', '12:00', 50);
        expect(result[0]).toEqual({ hora_inicio: '07:00', hora_fin: '07:50' });
        expect(result[result.length - 1]).toEqual({ hora_inicio: '11:10', hora_fin: '12:00' });
    });

    it('no genera franjas que excedan la hora final', () => {
        const result = generarIntervalosRegulares('07:00', '09:00', 50);
        result.forEach(i => {
            expect(horaAMinutos(i.hora_fin)).toBeLessThanOrEqual(horaAMinutos('09:00'));
        });
    });

    it('lanza error si duracion <= 0', () => {
        expect(() => generarIntervalosRegulares('07:00', '09:00', 0)).toThrow('mayor a 0');
    });

    it('lanza error si hora_inicio >= hora_fin', () => {
        expect(() => generarIntervalosRegulares('09:00', '07:00', 30)).toThrow('menor que la hora de fin');
    });
});

// ─── minutosAHora ─────────────────────────────────────────────────────────────

describe('minutosAHora', () => {
    it('convierte 420 a 07:00', () => expect(minutosAHora(420)).toBe('07:00'));
    it('convierte 470 a 07:50', () => expect(minutosAHora(470)).toBe('07:50'));
    it('convierte 0 a 00:00',   () => expect(minutosAHora(0)).toBe('00:00'));
});
