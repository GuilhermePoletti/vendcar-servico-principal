import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { UsuarioRepositoryPort } from '../../ports/out/usuario.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { RoleUsuario } from '../../../domain/enums/role-usuario.enum';

export interface RegistrarUsuarioInput {
  nome: string;
  email: string;
  senha: string;
  role?: RoleUsuario;
}

@Injectable()
export class RegistrarUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepositoryPort) {}

  async execute(input: RegistrarUsuarioInput): Promise<Omit<Usuario, 'senhaHash'>> {
    const existente = await this.usuarioRepository.buscarPorEmail(input.email);
    if (existente) {
      throw new DomainException(`Já existe um usuário com o e-mail ${input.email}`);
    }

    const senhaHash = await bcrypt.hash(input.senha, 10);
    const usuario = new Usuario({
      nome: input.nome,
      email: input.email,
      senhaHash,
      role: input.role,
    });

    return this.usuarioRepository.salvar(usuario);
  }
}
