import { Injectable } from '@nestjs/common';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { VeiculoRepositoryPort } from '../../ports/out/veiculo.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { StatusVeiculo } from '../../../domain/enums/status-veiculo.enum';

@Injectable()
export class VenderVeiculoUseCase {
  constructor(private readonly veiculoRepository: VeiculoRepositoryPort) {}

  async execute(id: string): Promise<Veiculo> {
    const veiculo = await this.veiculoRepository.buscarPorId(id);
    if (!veiculo) {
      throw new DomainException(`Veículo com ID ${id} não encontrado`);
    }

    veiculo.vender();
    return this.veiculoRepository.atualizar(id, { status: StatusVeiculo.VENDIDO });
  }
}
