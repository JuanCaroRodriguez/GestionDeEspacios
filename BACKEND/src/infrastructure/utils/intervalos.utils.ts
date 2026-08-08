export interface IntervaloInput {
    hora_inicio: string;
    hora_fin: string;
}

/** Convierte "HH:MM" a minutos desde medianoche */
export function horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

/** Valida que la hora tenga formato HH:MM */
export function esHoraValida(hora: string): boolean {
    return /^\d{2}:\d{2}$/.test(hora);
}

/** Determina si dos intervalos se superponen */
export function haySuperposicion(a: IntervaloInput, b: IntervaloInput): boolean {
    const aInicio = horaAMinutos(a.hora_inicio);
    const aFin = horaAMinutos(a.hora_fin);
    const bInicio = horaAMinutos(b.hora_inicio);
    const bFin = horaAMinutos(b.hora_fin);
    return aInicio < bFin && aFin > bInicio;
}

/**
 * Valida una colección de intervalos:
 * - Formato de horas válido
 * - hora_inicio < hora_fin
 * - No superposiciones
 * - No duplicados
 * - Al menos un intervalo
 * Lanza Error con mensaje descriptivo ante cualquier infracción.
 */
export function validarIntervalos(intervalos: IntervaloInput[]): void {
    if (!Array.isArray(intervalos) || intervalos.length === 0) {
        throw new Error('Debe proporcionar al menos una franja horaria');
    }

    for (const intervalo of intervalos) {
        if (!esHoraValida(intervalo.hora_inicio) || !esHoraValida(intervalo.hora_fin)) {
            throw new Error(
                `Formato de hora inválido en "${intervalo.hora_inicio} - ${intervalo.hora_fin}". Use HH:MM (24 horas)`
            );
        }

        const inicio = horaAMinutos(intervalo.hora_inicio);
        const fin = horaAMinutos(intervalo.hora_fin);

        if (inicio === fin) {
            throw new Error(
                `La franja ${intervalo.hora_inicio} - ${intervalo.hora_fin} tiene duración cero`
            );
        }

        if (inicio > fin) {
            throw new Error(
                `La hora inicial (${intervalo.hora_inicio}) debe ser menor que la hora final (${intervalo.hora_fin})`
            );
        }
    }

    // Ordenar por hora_inicio para detectar superposiciones eficientemente
    const ordenados = [...intervalos].sort(
        (a, b) => horaAMinutos(a.hora_inicio) - horaAMinutos(b.hora_inicio)
    );

    for (let i = 1; i < ordenados.length; i++) {
        const anterior = ordenados[i - 1];
        const actual = ordenados[i];
        if (horaAMinutos(actual.hora_inicio) < horaAMinutos(anterior.hora_fin)) {
            throw new Error(
                `La franja ${actual.hora_inicio} - ${actual.hora_fin} se superpone con la franja ${anterior.hora_inicio} - ${anterior.hora_fin}`
            );
        }
    }
}

/**
 * Genera intervalos regulares entre horaInicio y horaFin con una duración fija en minutos.
 * No genera el último intervalo si excedería horaFin.
 */
export function generarIntervalosRegulares(
    horaInicio: string,
    horaFin: string,
    duracionMinutos: number
): IntervaloInput[] {
    if (!esHoraValida(horaInicio) || !esHoraValida(horaFin)) {
        throw new Error('Formato de hora inválido. Use HH:MM');
    }
    if (duracionMinutos <= 0) {
        throw new Error('La duración del intervalo debe ser mayor a 0 minutos');
    }

    const inicio = horaAMinutos(horaInicio);
    const fin = horaAMinutos(horaFin);

    if (inicio >= fin) {
        throw new Error('La hora de inicio debe ser menor que la hora de fin');
    }

    const resultado: IntervaloInput[] = [];
    let actual = inicio;

    while (actual + duracionMinutos <= fin) {
        const siguienteStr = minutosAHora(actual + duracionMinutos);
        resultado.push({
            hora_inicio: minutosAHora(actual),
            hora_fin: siguienteStr
        });
        actual += duracionMinutos;
    }

    return resultado;
}

/** Convierte minutos desde medianoche a "HH:MM" */
export function minutosAHora(minutos: number): string {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
