import axiosInstance from "../axios";

const reservasService = {
  // Obtener todas las reservas
  async getAll() {
    try {
      const response = await axiosInstance.get(`/reservas`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas:", error);
      throw error;
    }
  },

  // Obtener reservas por espacio
  async getByEspacio(espacioId, id_empresa) {
    try {
      const response = await axiosInstance.get(
        `/reservas/espacio/${espacioId}`,
        {
          params: { id_empresa },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas del espacio:", error);
      throw error;
    }
  },

  // Obtener todas las reservas de la empresa
  async getAllByEmpresa(id_empresa) {
    try {
      const response = await axiosInstance.get(
        `/reservas/empresa/${id_empresa}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas de la empresa:", error);
      throw error;
    }
  },

  // Obtener reservas por persona
  async getByPersona(personaId) {
    try {
      const response = await axiosInstance.get(
        `/reservas/persona/${personaId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener reservas de la persona:", error);
      throw error;
    }
  },

  // Crear nueva reserva
  async create(reservaData) {
    try {
      const response = await axiosInstance.post(`/reservas`, reservaData);
      return response.data;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  },

  // Verificar disponibilidad
  async verificarDisponibilidad(datos) {
    try {
      const response = await axiosInstance.post(
        `/disponibilidad/verificar`,
        datos,
      );
      return response.data;
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      throw error;
    }
  },

  // Obtener horarios disponibles
  async getHorariosDisponibles(espacioId, fecha, id_empresa, opciones = {}) {
    try {
      const params = {
        espacioId,
        fecha,
        id_empresa,
        ...opciones,
      };
      const response = await axiosInstance.get(
        `/disponibilidad/horarios-disponibles`,
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener horarios disponibles:", error);
      throw error;
    }
  },

  // Crear reserva
  async create(reservaData) {
    try {
      const response = await axiosInstance.post(`/reservas`, reservaData);
      return response.data;
    } catch (error) {
      console.error("Error al crear reserva:", error);
      throw error;
    }
  },

  // Cancelar reserva
  async cancelar(id) {
    try {
      const response = await axiosInstance.put(`/reservas/${id}/cancelar`);
      return response.data;
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      throw error;
    }
  },

  // Formatear hora para consistencia
  formatearHora(hora) {
    if (!hora) return "";
    // Asegurar formato HH:MM
    const partes = hora.toString().split(":");
    if (partes.length === 1) {
      // Si viene como "730" convertir a "07:30"
      const horaStr = partes[0].padStart(4, "0");
      return `${horaStr.slice(0, 2)}:${horaStr.slice(2)}`;
    }
    return hora;
  },

  // Convertir timeSlot a horas de inicio y fin
  timeSlotToHoras(timeSlot) {
    const [inicio, fin] = timeSlot.split(" - ");
    return {
      horaInicio: this.formatearHora(inicio),
      horaFin: this.formatearHora(fin),
    };
  },

  // Verificar si una reserva afecta a un día y hora específicos
  reservaAfectaHorario(
    reserva,
    fecha,
    diaSemana,
    horaInicio,
    horaFin,
    id_empresa,
  ) {
    // Si la reserva no está activa, no afecta
    if (reserva.estado !== "Reservada") return false;

    // Verificar si es la misma empresa
    if (reserva.id_empresa !== id_empresa) return false;

    // Convertir horas a minutos para comparación
    const reservaInicio = this.horaAMinutos(reserva.horaInicio);
    const reservaFin = this.horaAMinutos(reserva.horaFin);
    const consultaInicio = this.horaAMinutos(horaInicio);
    const consultaFin = this.horaAMinutos(horaFin);

    // Verificar solapamiento de horarios
    const haySolapamiento =
      (consultaInicio >= reservaInicio && consultaInicio < reservaFin) ||
      (consultaFin > reservaInicio && consultaFin <= reservaFin) ||
      (consultaInicio <= reservaInicio && consultaFin >= reservaFin);

    if (!haySolapamiento) return false;

    // Verificar si aplica según el tipo de reserva
    if (reserva.tipo === "ocasional") {
      // Reserva ocasional: solo aplica en la fecha exacta
      const fechaReserva = new Date(reserva.fecha);
      const fechaConsulta = new Date(fecha);
      return this.esMismaFecha(fechaReserva, fechaConsulta);
    } else {
      // Reserva permanente: aplica en el mismo día de la semana
      const fechaReserva = new Date(reserva.fecha);
      const diaReserva = fechaReserva.getDay(); // 0 = domingo, 1 = lunes, etc.
      const diaConsulta = this.obtenerNumeroDia(diaSemana);
      return diaReserva === diaConsulta;
    }
  },

  // Helper functions
  horaAMinutos(hora) {
    // Manejar formato con AM/PM (ej: "09:30AM", "12:50PM")
    if (
      typeof hora === "string" &&
      (hora.includes("AM") || hora.includes("PM"))
    ) {
      const timePart = hora.replace(/AM|PM/g, "");
      const [hours, minutes] = timePart.split(":").map(Number);
      const period = hora.includes("AM") ? "AM" : "PM";

      let horas24 = hours;

      if (period === "PM" && hours !== 12) {
        // PM (excepto 12 PM) sumar 12
        horas24 = hours + 12;
      } else if (period === "AM" && hours === 12) {
        // 12 AM convertir a 0
        horas24 = 0;
      }

      return horas24 * 60 + minutes;
    }

    // Formato original sin AM/PM (para compatibilidad)
    const [hours, minutes] = hora.split(":").map(Number);
    return hours * 60 + minutes;
  },

  esMismaFecha(fecha1, fecha2) {
    // Para fechas UTC guardadas como medianoche, ajustar a la zona local correcta
    const ajustarFechaUTC = (fecha) => {
      const f = new Date(fecha);
      // Si es medianoche UTC, sumar el offset de la zona para obtener el día correcto
      if (
        f.getUTCHours() === 0 &&
        f.getUTCMinutes() === 0 &&
        f.getUTCSeconds() === 0
      ) {
        // Crear fecha en UTC y obtener los componentes directamente
        return {
          dia: f.getUTCDate(),
          mes: f.getUTCMonth(),
          año: f.getUTCFullYear(),
        };
      }
      // Para otras fechas, usar componentes locales
      return {
        dia: f.getDate(),
        mes: f.getMonth(),
        año: f.getFullYear(),
      };
    };

    const c1 = ajustarFechaUTC(fecha1);
    const c2 = {
      dia: fecha2.getDate(),
      mes: fecha2.getMonth(),
      año: fecha2.getFullYear(),
    };

    return c1.dia === c2.dia && c1.mes === c2.mes && c1.año === c2.año;
  },

  // Cancelar reserva
  async cancelReserva(reservaId) {
    try {
      const response = await axiosInstance.put(
        `/reservas/${reservaId}/cancelar`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al cancelar reserva:", error);
      throw error;
    }
  },

  // Actualizar el estado de una reserva
  async updateEstado(reservaId, nuevoEstado, motivo_cancelacion = null) {
    try {
      const body = { estado: nuevoEstado };
      if (motivo_cancelacion) body.motivo_cancelacion = motivo_cancelacion;
      const response = await axiosInstance.put(
        `/reservas/${reservaId}/estado`,
        body,
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar estado de reserva:", error);
      throw error;
    }
  },

  obtenerNumeroDia(diaSemana) {
    const dias = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };
    return dias[diaSemana] || 1;
  },
};

export default reservasService;
