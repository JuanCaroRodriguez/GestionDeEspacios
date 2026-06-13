import { IReservaRepository } from "../../domain/repositories/IReserva.repository";
import { Reserva } from "../../domain/Reserva";
import { Usuario } from "../../domain/Usuario";
import { ReservaModel, IReserva } from "../models/Reserva.model";
import { UsuarioModel } from "../models/Usuario.model";
import { AdministradorModel } from "../models/Administrador.model";
import { SuperAdminModel } from "../models/SuperAdmin.model";

export class ReservaRepository implements IReservaRepository {
  async create(reserva: Reserva): Promise<Reserva> {
    const reservaDoc = new ReservaModel({
      id: reserva.getId(),
      personaId: reserva.getPersona().getId(),
      espacioId: reserva.getEspacioId(),
      fecha: reserva.getFecha(),
      horaInicio: reserva.getHoraInicio(),
      horaFin: reserva.getHoraFin(),
      tipo: reserva.getTipo(),
      fechaInicio: reserva.getFechaInicio(),
      fechaFin: reserva.getFechaFin(),
      estado: reserva.getEstado(),
      motivo: reserva.getMotivo(),
      id_empresa: reserva.getIdEmpresa(),
    });

    const savedReserva = await reservaDoc.save();
    return await this.mapToEntityWithoutPersona(savedReserva);
  }

  async findById(id: string): Promise<Reserva | null> {
    const reservaDoc = await ReservaModel.findOne({ id });
    return reservaDoc ? await this.mapToEntity(reservaDoc) : null;
  }

  async findAll(): Promise<Reserva[]> {
    const reservas = await ReservaModel.find();
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async update(
    id: string,
    reservaData: Partial<Reserva>,
  ): Promise<Reserva | null> {
    const updatedReserva = await ReservaModel.findOneAndUpdate(
      { id },
      reservaData,
      { new: true },
    );
    return updatedReserva ? await this.mapToEntity(updatedReserva) : null;
  }

  async updateEstado(id: string, estado: string): Promise<Reserva | null> {
    const updatedReserva = await ReservaModel.findOneAndUpdate(
      { id },
      { estado },
      { new: true },
    );
    return updatedReserva ? await this.mapToEntity(updatedReserva) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ReservaModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async findByPersonaId(personaId: string): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({ personaId });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findByEspacioId(espacioId: string): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({ espacioId });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findByEstado(estado: string): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({ estado });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findByDateRange(fechaInicio: Date, fechaFin: Date): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({
      $or: [
        { fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } },
      ],
    });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findActiveReservas(): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({ estado: "Reservada" });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findReservasByEspacioAndDateRange(
    espacioId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({
      espacioId,
      estado: "Reservada",
      $or: [
        { fechaInicio: { $lte: fechaFin }, fechaFin: { $gte: fechaInicio } },
      ],
    });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async existsById(id: string): Promise<boolean> {
    const reserva = await ReservaModel.findOne({ id });
    return !!reserva;
  }

  async cancelReserva(id: string): Promise<boolean> {
    const result = await ReservaModel.updateOne(
      { id },
      { estado: "Cancelada" },
    );
    return result.modifiedCount > 0;
  }

  async findByEspacioAndEmpresa(
    espacioId: string,
    id_empresa: string,
  ): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({
      espacioId,
      id_empresa,
      estado: "Reservada",
    });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  async findByEmpresa(id_empresa: string): Promise<Reserva[]> {
    const reservas = await ReservaModel.find({
      id_empresa,
    });
    return await Promise.all(
      reservas.map((reserva) => this.mapToEntity(reserva)),
    );
  }

  private async mapToEntityWithoutPersona(
    reservaDoc: IReserva,
  ): Promise<Reserva> {
    // Crear una persona genérica sin buscar en la base de datos
    const persona = new Usuario(
      reservaDoc.personaId,
      "Usuario",
      "usuario@ejemplo.com",
      "",
      "estudiante",
    );

    const reserva = new Reserva(
      reservaDoc.id,
      persona,
      reservaDoc.espacioId,
      reservaDoc.fecha,
      reservaDoc.horaInicio,
      reservaDoc.horaFin,
      reservaDoc.tipo,
      reservaDoc.motivo || "",
      reservaDoc.id_empresa || "",
    );

    // Establecer el estado
    reserva.setEstado(reservaDoc.estado || "Reservada");

    return reserva;
  }

  private async mapToEntity(reservaDoc: IReserva): Promise<Reserva> {
    // Buscar la persona en las 3 colecciones posibles
    let personaDoc = await UsuarioModel.findOne({ id: reservaDoc.personaId });
    let tipoPersona = "estudiante";

    if (!personaDoc) {
      personaDoc = await AdministradorModel.findOne({
        id: reservaDoc.personaId,
      });
      tipoPersona = "administrador";
    }

    if (!personaDoc) {
      personaDoc = await SuperAdminModel.findOne({ id: reservaDoc.personaId });
      tipoPersona = "superadmin";
    }

    if (!personaDoc) {
      throw new Error(`Persona no encontrada con ID: ${reservaDoc.personaId}`);
    }

    const persona = new Usuario(
      personaDoc.id,
      personaDoc.nombre,
      personaDoc.email,
      personaDoc.contraseña || "",
      tipoPersona as "estudiante" | "docente",
    );

    const reserva = new Reserva(
      reservaDoc.id,
      persona,
      reservaDoc.espacioId,
      reservaDoc.fecha,
      reservaDoc.horaInicio,
      reservaDoc.horaFin,
      reservaDoc.tipo,
      reservaDoc.motivo || "",
      reservaDoc.id_empresa || "",
    );

    // Establecer el estado
    reserva.setEstado(
      reservaDoc.estado as
        | "Reservada"
        | "Ejecutada"
        | "Cancelada"
        | "Pendiente",
    );

    return reserva;
  }
}
