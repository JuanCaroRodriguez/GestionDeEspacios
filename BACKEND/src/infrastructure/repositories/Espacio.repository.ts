import { IEspacioRepository } from '../../domain/repositories/IEspacio.repository';
import { Espacio } from '../../domain/Espacio';
import { EspacioModel, IEspacio } from '../models/Espacio.model';
import { ReservaModel } from '../models/Reserva.model';

export class EspacioRepository implements IEspacioRepository {
    
    async create(espacio: Espacio): Promise<Espacio> {
        const espacioDoc = new EspacioModel({
            id: espacio.getId(),
            nombre: espacio.getNombre(),
            tipo: espacio.getTipo(),
            capacidad: espacio.getCapacidad(),
            ubicacion: espacio.getUbicacion(),
            disponible: espacio.getDisponible()
        });
        
        const savedEspacio = await espacioDoc.save();
        return this.mapToEntity(savedEspacio);
    }

    async findById(id: string): Promise<Espacio | null> {
        const espacioDoc = await EspacioModel.findOne({ id });
        return espacioDoc ? this.mapToEntity(espacioDoc) : null;
    }

    async findAll(): Promise<Espacio[]> {
        const espacios = await EspacioModel.find();
        return espacios.map(espacio => this.mapToEntity(espacio));
    }

    async update(id: string, espacioData: Partial<Espacio>): Promise<Espacio | null> {
        const updatedEspacio = await EspacioModel.findOneAndUpdate(
            { id },
            espacioData,
            { new: true }
        );
        return updatedEspacio ? this.mapToEntity(updatedEspacio) : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await EspacioModel.deleteOne({ id });
        return result.deletedCount > 0;
    }

    async findByDisponible(disponible: boolean): Promise<Espacio[]> {
        const espacios = await EspacioModel.find({ disponible });
        return espacios.map(espacio => this.mapToEntity(espacio));
    }

    async findByTipo(tipo: string): Promise<Espacio[]> {
        const espacios = await EspacioModel.find({ tipo });
        return espacios.map(espacio => this.mapToEntity(espacio));
    }

    async findByUbicacion(ubicacion: string): Promise<Espacio[]> {
        const espacios = await EspacioModel.find({ ubicacion });
        return espacios.map(espacio => this.mapToEntity(espacio));
    }

    async existsById(id: string): Promise<boolean> {
        const espacio = await EspacioModel.findOne({ id });
        return !!espacio;
    }

    async findAvailableByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Espacio[]> {
        // Encontrar espacios que no tienen reservas en el rango de fechas
        const espaciosOcupados = await ReservaModel.find({
            estado: 'activa',
            $or: [
                { fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } }
            ]
        }).distinct('espacioId');

        const espaciosDisponibles = await EspacioModel.find({
            id: { $nin: espaciosOcupados },
            disponible: true
        });

        return espaciosDisponibles.map(espacio => this.mapToEntity(espacio));
    }

    private mapToEntity(espacioDoc: IEspacio): Espacio {
        const espacio = new Espacio(
            espacioDoc.id,
            espacioDoc.nombre,
            espacioDoc.tipo,
            espacioDoc.capacidad,
            espacioDoc.ubicacion
        );
        espacio.setDisponible(espacioDoc.disponible);
        return espacio;
    }
}
