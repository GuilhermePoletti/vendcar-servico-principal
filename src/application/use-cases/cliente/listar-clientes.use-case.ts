import { Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { ClienteRepositoryPort } from '../../ports/out/cliente.repository.port';

@Injectable()
export class ListarClientesUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryPort) {}

  async execute(): Promise<Cliente[]> {
    return this.clienteRepository.listar();
  }
}
