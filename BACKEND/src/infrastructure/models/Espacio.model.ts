import { Schema, model, Document } from 'mongoose';

export interface IEspacio extends Document {
    id: string;
    nombre: string;
    tipo: string;
    capacidad: number;
    ubicacion: string;
    disponible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EspacioSchema = new Schema<IEspacio>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    capacidad: {
        type: Number,
        required: true,
        min: 1
    },
    ubicacion: {
        type: String,
        required: true
    },
    disponible: {
        type: Boolean,
        default: true,
        required: true
    }
}, {
    timestamps: true,
    collection: 'espacios'
});

export const EspacioModel = model<IEspacio>('Espacio', EspacioSchema);
