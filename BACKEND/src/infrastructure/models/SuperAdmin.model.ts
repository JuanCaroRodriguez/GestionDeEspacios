import { Schema, model, Document } from "mongoose";

export interface ISuperAdmin extends Document {
  id: string;
  nombre: string;
  email: string;
  contraseña: string;
  permisos: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new Schema<ISuperAdmin>(
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
      default: [
        "crear_espacios",
        "eliminar_espacios",
        "modificar_espacios",
        "crear_usuarios",
        "eliminar_usuarios",
        "modificar_usuarios",
        "suspender_usuarios",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "superadmins",
  },
);

export const SuperAdminModel = model<ISuperAdmin>(
  "SuperAdmin",
  SuperAdminSchema,
);
