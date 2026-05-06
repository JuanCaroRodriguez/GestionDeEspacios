import { IReservaRepository } from '../../domain/repositories/IReserva.repository';
import { Reserva } from '../../domain/Reserva';
import { Usuario } from '../../domain/Usuario';
import { ReservaModel, IReserva } from '../models/Reserva.model';
import { UsuarioModel } from '../models/Usuario.model';

export class ReservaRepository implements IReservaRepository {
    
    async create(reserva: Reserva): Promise<Reserva> {
        const reservaDoc = new ReservaModel({
            id: reserva.getId(),
            personaId: reserva.getPersona().getId(),
            espacioId: reserva.getEspacioId(),
            fechaInicio: reserva.getFechaInicio(),
            fechaFin: reserva.getFechaFin(),
            estado: reserva.getEstado()
        });
        
        const savedReserva = await reservaDoc.save();
        return await this.mapToEntity(savedReserva);
    }

    async findById(id: string): Promise<Reserva | null> {
        const reservaDoc = await ReservaModel.findOne({ id });
        return reservaDoc ? await this.mapToEntity(reservaDoc) : null;
    }

    async findAll(): Promise<Reserva[]> {
        const reservas = await ReservaModel.find();
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async update(id: string, reservaData: Partial<Reserva>): Promise<Reserva | null> {
        const updatedReserva = await ReservaModel.findOneAndUpdate(
            { id },
            reservaData,
            { new: true }
        );
        return updatedReserva ? await this.mapToEntity(updatedReserva) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await ReservaModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findByPersonaId(personaId: string): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({ personaId });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async findByEspacioId(espacioId: string): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({ espacioId });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async findByEstado(estado: string): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({ estado });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({
            $or: [
                { fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } }
            ]
        });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async findActiveReservas(): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({ estado: 'activa' });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async findReservasByEspacioAndDateRange(espacioId: string, fechaInicio: Date, fechaFin: Date): Promise<Reserva[]> {
        const reservas = await ReservaModel.find({
            espacioId,
            estado: 'activa',
            $or: [
                { fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } }
            ]
        });
        return await Promise.all(reservas.map(reserva => this.mapToEntity(reserva)));
    }

    async existsById(id: string): Promise<boolean> {
        const reserva = await ReservaModel.findOne({ id });
        return !!reserva;
    }

    async cancelReserva(id: string): Promise<boolean> {
        const result = await ReservaModel.updateOne(
            { id },
            { estado: 'cancelada' }
        );
        return result.modifiedCount > 0;
    }

    private async mapToEntity(reservaDoc: IReserva): Promise<Reserva> {
        // Buscar la persona
        const personaDoc = await UsuarioModel.findOne({ id: reservaDoc.personaId });
        if (!personaDoc) {
            throw new Error(`Persona no encontrada con ID: ${reservaDoc.personaId}`);
        }

        const persona = new Usuario(
            personaDoc.id,
            personaDoc.nombre,
            personaDoc.email,
            personaDoc.contraseña,
            personaDoc.tipo
        );

        const reserva = new Reserva(
            reservaDoc.id,
            persona,
            reservaDoc.espacioId,
            reservaDoc.fechaInicio,
            reservaDoc.fechaFin
        );
        
        // Establecer el estado
        reserva.setEstado(reservaDoc.estado);
        
        return reserva;
    }
}
