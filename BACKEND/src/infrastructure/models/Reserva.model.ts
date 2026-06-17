import { Schema, model, Document } from "mongoose";

export interface IReserva extends Document {
  id: string;
  personaId: string;
  espacioId: string;
  fecha: Date;
  horaInicio: string;
  horaFin: string;
  tipo: "permanente" | "ocasional";
  fechaInicio: Date;
  fechaFin: Date;
  estado: "Reservada" | "Ejecutada" | "Cancelada" | "Pendiente";
  motivo: string;
  motivo_cancelacion?: string | null;
  id_empresa: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservaSchema = new Schema<IReserva>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    personaId: {
      type: String,
      required: true,
      ref: "Usuario",
    },
    espacioId: {
      type: String,
      required: true,
      ref: "Espacio",
    },
    fecha: {
      type: Date,
      required: true,
    },
    horaInicio: {
      type: String,
      required: true,
    },
    horaFin: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["permanente", "ocasional"],
      required: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaFin: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["Reservada", "Ejecutada", "Cancelada", "Pendiente"],
      default: "Reservada",
      required: true,
    },
    motivo: {
      type: String,
      required: true,
    },
    motivo_cancelacion: {
      type: String,
      default: null,
    },
    id_empresa: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "reservas",
  },
);

// Índices para mejor rendimiento
ReservaSchema.index({ espacioId: 1, fechaInicio: 1, fechaFin: 1 });
ReservaSchema.index({ personaId: 1 });
ReservaSchema.index({ estado: 1 });
ReservaSchema.index({ id_empresa: 1 });
ReservaSchema.index({ espacioId: 1, id_empresa: 1 });

export const ReservaModel = model<IReserva>("Reserva", ReservaSchema);
