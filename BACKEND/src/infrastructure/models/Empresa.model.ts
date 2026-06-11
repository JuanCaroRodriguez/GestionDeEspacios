import { Schema, model, Document } from 'mongoose';

export interface IEmpresa extends Document {
    id: string;
    nombre: string;
    nit: string;
    createdAt: Date;
    updatedAt: Date;
}

const EmpresaSchema = new Schema<IEmpresa>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    nit: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, {
    timestamps: true,
    collection: 'empresas'
});

// Índices para mejorar rendimiento
EmpresaSchema.index({ nit: 1 });
EmpresaSchema.index({ id: 1 });

export const EmpresaModel = model<IEmpresa>('Empresa', EmpresaSchema);
