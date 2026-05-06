import { Schema, model, Document } from 'mongoose';

export interface IReserva extends Document {
    id: string;
    personaId: string;
    espacioId: string;
    fechaInicio: Date;
    fechaFin: Date;
    estado: 'activa' | 'cancelada' | 'completada' | 'pendiente';
    motivo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReservaSchema = new Schema<IReserva>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    personaId: {
        type: String,
        required: true,
        ref: 'Usuario'
    },
    espacioId: {
        type: String,
        required: true,
        ref: 'Espacio'
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    estado: {
        type: String,
        enum: ['activa', 'cancelada', 'completada', 'pendiente'],
        default: 'activa',
        required: true
    },
    motivo: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    collection: 'reservas'
});

// Índices para mejor rendimiento
ReservaSchema.index({ espacioId: 1, fechaInicio: 1, fechaFin: 1 });
ReservaSchema.index({ personaId: 1 });
ReservaSchema.index({ estado: 1 });

export const ReservaModel = model<IReserva>('Reserva', ReservaSchema);
