import { Schema, model, Document } from 'mongoose';

export interface IIntervalo extends Document {
    id: string;
    id_empresa: string;
    hora_inicio: string;
    hora_fin: string;
    orden: number;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const IntervaloSchema = new Schema<IIntervalo>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    id_empresa: {
        type: String,
        required: true
    },
    hora_inicio: {
        type: String,
        required: true,
        trim: true
    },
    hora_fin: {
        type: String,
        required: true,
        trim: true
    },
    orden: {
        type: Number,
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'intervalos'
});

IntervaloSchema.index({ id_empresa: 1, orden: 1 });
IntervaloSchema.index({ id: 1 });

export const IntervaloModel = model<IIntervalo>('Intervalo', IntervaloSchema);
