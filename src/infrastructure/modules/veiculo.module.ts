import { Module } from '@nestjs/common';
import { VeiculoController } from '../adapters/in/veiculo.controller';
import { PrismaVeiculoRepository } from '../adapters/out/prisma-veiculo.repository';
import { PrismaMarcaRepository } from '../adapters/out/prisma-marca.repository';
import { VeiculoRepositoryPort } from '../../application/ports/out/veiculo.repository.port';
import { MarcaRepositoryPort } from '../../application/ports/out/marca.repository.port';
import { CriarVeiculoUseCase } from '../../application/use-cases/veiculo/criar-veiculo.use-case';
import { ListarVeiculosDisponiveisUseCase } from '../../application/use-cases/veiculo/listar-veiculos-disponiveis.use-case';
import { AtualizarVeiculoUseCase } from '../../application/use-cases/veiculo/atualizar-veiculo.use-case';
import { DeletarVeiculoUseCase } from '../../application/use-cases/veiculo/deletar-veiculo.use-case';
import { ReservarVeiculoUseCase } from '../../application/use-cases/veiculo/reservar-veiculo.use-case';
import { VenderVeiculoUseCase } from '../../application/use-cases/veiculo/vender-veiculo.use-case';
import { DisponibilizarVeiculoUseCase } from '../../application/use-cases/veiculo/disponibilizar-veiculo.use-case';

@Module({
  controllers: [VeiculoController],
  providers: [
    // Repositórios → tokens abstratos
    {
      provide: VeiculoRepositoryPort,
      useClass: PrismaVeiculoRepository,
    },
    {
      provide: MarcaRepositoryPort,
      useClass: PrismaMarcaRepository,
    },
    // Use Cases
    CriarVeiculoUseCase,
    ListarVeiculosDisponiveisUseCase,
    AtualizarVeiculoUseCase,
    DeletarVeiculoUseCase,
    ReservarVeiculoUseCase,
    VenderVeiculoUseCase,
    DisponibilizarVeiculoUseCase,
  ],
})
export class VeiculoModule {}
