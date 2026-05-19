import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioRepositoryPort } from '../../ports/out/usuario.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginOutput {
  access_token: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const usuario = await this.usuarioRepository.buscarPorEmail(input.email);
    if (!usuario) {
      throw new DomainException('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new DomainException('Credenciais inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email, role: usuario.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
