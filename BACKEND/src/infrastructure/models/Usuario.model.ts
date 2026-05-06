import { Schema, model, Document } from "mongoose";

export interface IUsuario extends Document {
  id: string;
  nombre: string;
  email: string;
  contraseña: string;
  tipo: "estudiante" | "docente";
  estado: "activo" | "inactivo" | "suspendido";
  createdAt: Date;
  updatedAt: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
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
    tipo: {
      type: String,
      enum: ["estudiante", "docente"],
      default: "estudiante",
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
    collection: "usuarios",
  },
);

export const UsuarioModel = model<IUsuario>("Usuario", UsuarioSchema);
