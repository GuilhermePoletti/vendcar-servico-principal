import { Injectable } from '@nestjs/common';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { VeiculoRepositoryPort } from '../../ports/out/veiculo.repository.port';

@Injectable()
export class ListarVeiculosDisponiveisUseCase {
  constructor(private readonly veiculoRepository: VeiculoRepositoryPort) {}

  async execute(): Promise<Veiculo[]> {
    return this.veiculoRepository.listarDisponiveis();
  }
}
