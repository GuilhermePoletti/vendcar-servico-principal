import { Module } from '@nestjs/common';
import { ClienteController } from '../adapters/in/cliente.controller';
import { PrismaClienteRepository } from '../adapters/out/prisma-cliente.repository';
import { ClienteRepositoryPort } from '../../application/ports/out/cliente.repository.port';
import { CriarClienteUseCase } from '../../application/use-cases/cliente/criar-cliente.use-case';
import { BuscarClientePorCpfUseCase } from '../../application/use-cases/cliente/buscar-cliente-por-cpf.use-case';
import { ListarClientesUseCase } from '../../application/use-cases/cliente/listar-clientes.use-case';
import { AtualizarClienteUseCase } from '../../application/use-cases/cliente/atualizar-cliente.use-case';
import { DeletarClienteUseCase } from '../../application/use-cases/cliente/deletar-cliente.use-case';

@Module({
  controllers: [ClienteController],
  providers: [
    // Repositório → implementação concreta vinculada ao token abstrato
    {
      provide: ClienteRepositoryPort,
      useClass: PrismaClienteRepository,
    },
    // Use Cases
    CriarClienteUseCase,
    BuscarClientePorCpfUseCase,
    ListarClientesUseCase,
    AtualizarClienteUseCase,
    DeletarClienteUseCase,
  ],
  exports: [BuscarClientePorCpfUseCase],
})
export class ClienteModule {}
