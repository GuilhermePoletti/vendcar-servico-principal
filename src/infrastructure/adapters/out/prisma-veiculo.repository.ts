import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../prisma/prisma.service';
import { VeiculoRepositoryPort } from '../../../application/ports/out/veiculo.repository.port';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { StatusVeiculo } from '../../../domain/enums/status-veiculo.enum';

@Injectable()
export class PrismaVeiculoRepository implements VeiculoRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async salvar(veiculo: Veiculo): Promise<Veiculo> {
    const data = await this.prisma.veiculo.create({
      data: {
        id: veiculo.id,
        id_marca: veiculo.idMarca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        cor: veiculo.cor,
        preco: veiculo.preco,
        status: veiculo.status,
      },
    });
    return this.toDomain(data);
  }

  async buscarPorId(id: string): Promise<Veiculo | null> {
    const data = await this.prisma.veiculo.findUnique({ where: { id } });
    return data ? this.toDomain(data) : null;
  }

  async listarDisponiveis(): Promise<Veiculo[]> {
    const data = await this.prisma.veiculo.findMany({
      where: { status: 'DISPONIVEL' },
      orderBy: { preco: 'asc' },
    });
    return data.map((d) => this.toDomain(d));
  }

  async atualizar(
    id: string,
    updateData: { modelo?: string; ano?: number; cor?: string; preco?: number; status?: StatusVeiculo },
  ): Promise<Veiculo> {
    const data = await this.prisma.veiculo.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(data);
  }

  async deletar(id: string): Promise<void> {
    await this.prisma.veiculo.delete({ where: { id } });
  }

  private toDomain(data: {
    id: string;
    id_marca: string;
    modelo: string;
    ano: number;
    cor: string;
    preco: Decimal | number;
    status: string;
  }): Veiculo {
    return new Veiculo({
      id: data.id,
      idMarca: data.id_marca,
      modelo: data.modelo,
      ano: data.ano,
      cor: data.cor,
      preco: Number(data.preco),
      status: data.status as StatusVeiculo,
    });
  }
}
