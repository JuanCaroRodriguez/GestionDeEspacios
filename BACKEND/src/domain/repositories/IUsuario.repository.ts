import { Usuario } from "../Usuario";

export interface IUsuarioRepository {
  // CRUD operations
  create(usuario: Usuario): Promise<Usuario>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  update(id: string, usuario: Partial<Usuario>): Promise<Usuario | null>;
  updateEstado(id: string, estado: string): Promise<Usuario | null>;
  delete(id: string): Promise<boolean>;

  // Specific operations
  findByTipo(tipo: "estudiante" | "docente"): Promise<Usuario[]>;
  existsByEmail(email: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
