import { Schema, model, Document } from 'mongoose';

export interface ISalon {
    numero: string;
    nombre?: string;
}

export interface IPisoConfig {
    numero: number;
    cantidadSalones: number;
    salones: ISalon[];
}

export interface IBloque extends Document {
    id: string;
    nombre: string;
    id_empresa: string;
    pisos: IPisoConfig[];
    createdAt: Date;
    updatedAt: Date;
}

const SalonSchema = new Schema<ISalon>({
    numero: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: false
    }
});

const PisoSchema = new Schema<IPisoConfig>({
    numero: {
        type: Number,
        required: true
    },
    cantidadSalones: {
        type: Number,
        required: true
    },
    salones: [SalonSchema]
});

const BloqueSchema = new Schema<IBloque>({
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
    },
    pisos: [PisoSchema]
}, {
    timestamps: true,
    collection: 'bloques'
});

// Índices para mejorar rendimiento
BloqueSchema.index({ id_empresa: 1 });
BloqueSchema.index({ id: 1 });
BloqueSchema.index({ nombre: 1, id_empresa: 1 });

export const BloqueModel = model<IBloque>('Bloque', BloqueSchema);
