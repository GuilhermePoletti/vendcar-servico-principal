import { Injectable } from '@nestjs/common';
import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { VeiculoRepositoryPort } from '../../ports/out/veiculo.repository.port';
import { MarcaRepositoryPort } from '../../ports/out/marca.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface CriarVeiculoInput {
  idMarca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
}

@Injectable()
export class CriarVeiculoUseCase {
  constructor(
    private readonly veiculoRepository: VeiculoRepositoryPort,
    private readonly marcaRepository: MarcaRepositoryPort,
  ) {}

  async execute(input: CriarVeiculoInput): Promise<Veiculo> {
    const marca = await this.marcaRepository.buscarPorId(input.idMarca);
    if (!marca) {
      throw new DomainException(`Marca com ID ${input.idMarca} não encontrada`);
    }

    const veiculo = new Veiculo(input);
    return this.veiculoRepository.salvar(veiculo);
  }
}
