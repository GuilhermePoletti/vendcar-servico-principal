import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClienteRepositoryPort } from '../../../application/ports/out/cliente.repository.port';
import { Cliente } from '../../../domain/entities/cliente.entity';

@Injectable()
export class PrismaClienteRepository implements ClienteRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(cliente: Cliente): Promise<Cliente> {
    const data = await this.prisma.cliente.create({
      data: {
        id: cliente.id,
        nome: cliente.nome,
        cpf: cliente.cpf,
        email: cliente.email,
      },
    });
    return this.toDomain(data);
  }

  async buscarPorId(id: string): Promise<Cliente | null> {
    const data = await this.prisma.cliente.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async buscarPorCpf(cpf: string): Promise<Cliente | null> {
    const data = await this.prisma.cliente.findUnique({ where: { cpf } });
    return data ? this.toDomain(data) : null;
  }

  async listar(): Promise<Cliente[]> {
    const data = await this.prisma.cliente.findMany();
    return data.map((d) => this.toDomain(d));
  }

  async atualizar(id: string, updateData: { nome?: string; email?: string }): Promise<Cliente> {
    const data = await this.prisma.cliente.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(data);
  }

  async deletar(id: string): Promise<void> {
    await this.prisma.cliente.delete({ where: { id } });
  }

  private toDomain(data: { id: string; nome: string; cpf: string; email: string }): Cliente {
    return new Cliente({
      id: data.id,
      nome: data.nome,
      cpf: data.cpf,
      email: data.email,
    });
  }
}
