import { Injectable } from '@nestjs/common';
import { VeiculoRepositoryPort } from '../../ports/out/veiculo.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { StatusVeiculo } from '../../../domain/enums/status-veiculo.enum';

@Injectable()
export class DeletarVeiculoUseCase {
  constructor(private readonly veiculoRepository: VeiculoRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const veiculo = await this.veiculoRepository.buscarPorId(id);
    if (!veiculo) {
      throw new DomainException(`Veículo com ID ${id} não encontrado`);
    }
    if (veiculo.status !== StatusVeiculo.DISPONIVEL) {
      throw new DomainException(
        `Não é possível deletar veículo com status ${veiculo.status}. Apenas veículos DISPONIVEL podem ser deletados.`,
      );
    }
    return this.veiculoRepository.deletar(id);
  }
}
