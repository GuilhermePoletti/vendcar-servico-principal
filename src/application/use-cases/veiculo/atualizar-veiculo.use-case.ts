import { Injectable } from '@nestjs/common';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { VeiculoRepositoryPort } from '../../ports/out/veiculo.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface AtualizarVeiculoInput {
  modelo?: string;
  ano?: number;
  cor?: string;
  preco?: number;
}

@Injectable()
export class AtualizarVeiculoUseCase {
  constructor(private readonly veiculoRepository: VeiculoRepositoryPort) {}

  async execute(id: string, data: AtualizarVeiculoInput): Promise<Veiculo> {
    const existente = await this.veiculoRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainException(`Veículo com ID ${id} não encontrado`);
    }
    return this.veiculoRepository.atualizar(id, data);
  }
}
