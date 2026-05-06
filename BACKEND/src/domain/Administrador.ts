import { Persona } from "./Persona";

export class Administrador extends Persona {
  constructor(id: string, nombre: string, email: string, contraseña: string) {
    super(id, nombre, email, contraseña);
  }

  public cancelar(): void {
    console.log(`El administrador ${this.nombre} ha cancelado una reserva`);
  }

  public consultar(): void {
    console.log(`El administrador ${this.nombre} está consultando el sistema`);
  }

  public realizar(): void {
    console.log(`El administrador ${this.nombre} está gestionando el sistema`);
  }

  // Método exclusivo para evaluar solicitudes de reserva de laboratorios y espacios exclusivos de sistemas
  public evaluarSolicitudReservaLaboratorio(
    reservaId: string,
    solicitante: string,
    espacio: string,
    motivo: string,
  ): { aceptada: boolean; razon: string } {
    console.log(
      `El administrador ${this.nombre} está evaluando solicitud de reserva ${reservaId} para el espacio ${espacio}`,
    );

    // Lógica de evaluación (puede ser personalizada según criterios específicos)
    const criteriosAceptacion = this.evaluarCriterios(
      solicitante,
      espacio,
      motivo,
    );

    if (criteriosAceptacion.aceptada) {
      console.log(`✅ Solicitud ${reservaId} ACEPTADA para ${solicitante}`);
      console.log(`   Razón: ${criteriosAceptacion.razon}`);
      return { aceptada: true, razon: criteriosAceptacion.razon };
    } else {
      console.log(`❌ Solicitud ${reservaId} RECHAZADA para ${solicitante}`);
      console.log(`   Razón: ${criteriosAceptacion.razon}`);
      return { aceptada: false, razon: criteriosAceptacion.razon };
    }
  }

  private evaluarCriterios(
    solicitante: string,
    espacio: string,
    motivo: string,
  ): { aceptada: boolean; razon: string } {
    // Criterios de evaluación para espacios exclusivos de sistemas
    const espaciosExclusivos = [
      "Laboratorio de Sistemas",
      "Servidor Principal",
      "Sala de Redes",
    ];
    const motivosValidos = [
      "clase sistemas",
      "practica redes",
      "mantenimiento",
      "proyecto especial",
    ];

    if (!espaciosExclusivos.includes(espacio)) {
      return {
        aceptada: false,
        razon: "El espacio no requiere aprobación de administrador",
      };
    }

    const motivoLower = motivo.toLowerCase();
    const motivoValido = motivosValidos.some((valido) =>
      motivoLower.includes(valido),
    );

    if (!motivoValido) {
      return {
        aceptada: false,
        razon: "El motivo no es válido para espacios exclusivos de sistemas",
      };
    }

    // Verificar si el solicitante tiene permisos (simulado)
    if (
      solicitante.includes("admin") ||
      solicitante.includes("profesor") ||
      solicitante.includes("docente")
    ) {
      return {
        aceptada: true,
        razon: "Solicitante con autorización y motivo válido",
      };
    }

    return {
      aceptada: false,
      razon:
        "El solicitante no tiene los permisos necesarios para este espacio",
    };
  }
}
