import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UsuarioRepositoryPort } from '../../../application/ports/out/usuario.repository.port';
import { Usuario } from '../../../domain/entities/usuario.entity';
import { RoleUsuario } from '../../../domain/enums/role-usuario.enum';

@Injectable()
export class PrismaUsuarioRepository implements UsuarioRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(usuario: Usuario): Promise<Usuario> {
    const data = await this.prisma.usuario.create({
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: usuario.senhaHash,
        role: usuario.role,
      },
    });
    return this.toDomain(data);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const data = await this.prisma.usuario.findUnique({ where: { email } });
    return data ? this.toDomain(data) : null;
  }

  private toDomain(data: { id: string; nome: string; email: string; senha_hash: string; role: string }): Usuario {
    return new Usuario({
      id: data.id,
      nome: data.nome,
      email: data.email,
      senhaHash: data.senha_hash,
      role: data.role as RoleUsuario,
    });
  }
}
