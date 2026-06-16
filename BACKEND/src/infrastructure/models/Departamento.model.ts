import { Schema, model, Document } from 'mongoose';

export interface IDepartamento extends Document {
    id: string;
    nombre: string;
    id_empresa: string;
    createdAt: Date;
    updatedAt: Date;
}

const DepartamentoSchema = new Schema<IDepartamento>({
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
    id_empresa: {
        type: String,
        required: true,
        ref: 'Empresa'
    }
}, {
    timestamps: true,
    collection: 'departamentos'
});

// Índices para mejorar rendimiento
DepartamentoSchema.index({ id_empresa: 1 });
DepartamentoSchema.index({ id: 1 });
DepartamentoSchema.index({ nombre: 1, id_empresa: 1 });

export const DepartamentoModel = model<IDepartamento>('Departamento', DepartamentoSchema);
