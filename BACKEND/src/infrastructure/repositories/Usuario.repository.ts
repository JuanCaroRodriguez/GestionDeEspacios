import { IUsuarioRepository } from "../../domain/repositories/IUsuario.repository";
import { Usuario } from "../../domain/Usuario";
import { UsuarioModel, IUsuario } from "../models/Usuario.model";

export class UsuarioRepository implements IUsuarioRepository {
  async create(usuario: Usuario): Promise<Usuario> {
    const usuarioDoc = new UsuarioModel({
      id: usuario.getId(),
      nombre: usuario.getNombre(),
      email: usuario.getEmail(),
      contraseña: usuario.getContraseña(),
      tipo: usuario.getTipo(),
    });

    const savedUsuario = await usuarioDoc.save();
    return this.mapToEntity(savedUsuario);
  }

  async findById(id: string): Promise<Usuario | null> {
    const usuarioDoc = await UsuarioModel.findOne({ id });
    return usuarioDoc ? this.mapToEntity(usuarioDoc) : null;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const usuarioDoc = await UsuarioModel.findOne({ email });
    return usuarioDoc ? this.mapToEntity(usuarioDoc) : null;
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await UsuarioModel.find();
    return usuarios.map((usuario) => this.mapToEntity(usuario));
  }

  async update(
    id: string,
    usuarioData: Partial<Usuario>,
  ): Promise<Usuario | null> {
    const updatedUsuario = await UsuarioModel.findOneAndUpdate(
      { id },
      usuarioData,
      { new: true, runValidators: false },
    );
    return updatedUsuario ? this.mapToEntity(updatedUsuario) : null;
  }

  async updateEstado(id: string, estado: string): Promise<Usuario | null> {
    const updatedUsuario = await UsuarioModel.findOneAndUpdate(
      { id },
      { estado },
      { new: true, runValidators: false },
    );
    return updatedUsuario ? this.mapToEntity(updatedUsuario) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UsuarioModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async findByTipo(tipo: "estudiante" | "docente"): Promise<Usuario[]> {
    const usuarios = await UsuarioModel.find({ tipo });
    return usuarios.map((usuario) => this.mapToEntity(usuario));
  }

  async existsByEmail(email: string): Promise<boolean> {
    const usuario = await UsuarioModel.findOne({ email });
    return !!usuario;
  }

  async existsById(id: string): Promise<boolean> {
    const usuario = await UsuarioModel.findOne({ id });
    return !!usuario;
  }

  private mapToEntity(usuarioDoc: IUsuario): Usuario {
    const usuario = new Usuario(
      usuarioDoc.id,
      usuarioDoc.nombre,
      usuarioDoc.email,
      usuarioDoc.contraseña,
      usuarioDoc.tipo,
      usuarioDoc.estado,
    );
    return usuario;
  }
}
