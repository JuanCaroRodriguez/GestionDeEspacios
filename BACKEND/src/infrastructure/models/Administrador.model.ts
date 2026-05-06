import { Schema, model, Document } from "mongoose";

export interface IAdministrador extends Document {
  id: string;
  nombre: string;
  email: string;
  contraseña: string;
  permisos: string[];
  estado: "activo" | "inactivo" | "suspendido";
  createdAt: Date;
  updatedAt: Date;
}

const AdministradorSchema = new Schema<IAdministrador>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
    permisos: {
      type: [String],
      default: ["evaluar_reservas_laboratorios"],
      required: true,
    },
    estado: {
      type: String,
      enum: ["activo", "inactivo", "suspendido"],
      default: "activo",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "administradores",
  },
);

export const AdministradorModel = model<IAdministrador>(
  "Administrador",
  AdministradorSchema,
);
