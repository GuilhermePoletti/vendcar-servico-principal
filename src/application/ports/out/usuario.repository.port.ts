import { Usuario } from '../../../domain/entities/usuario.entity';

export abstract class UsuarioRepositoryPort {
  abstract salvar(usuario: Usuario): Promise<Usuario>;
  abstract buscarPorEmail(email: string): Promise<Usuario | null>;
}
