import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarcaRepositoryPort } from '../../../application/ports/out/marca.repository.port';
import { Marca } from '../../../domain/entities/marca.entity';

@Injectable()
export class PrismaMarcaRepository implements MarcaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Marca | null> {
    const data = await this.prisma.marca.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async listar(): Promise<Marca[]> {
    const data = await this.prisma.marca.findMany();
    return data.map((d) => this.toDomain(d));
  }

  private toDomain(data: { id: string; nome: string }): Marca {
    return new Marca({ id: data.id, nome: data.nome });
  }
}
