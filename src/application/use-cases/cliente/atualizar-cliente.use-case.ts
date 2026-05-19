import { Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { ClienteRepositoryPort } from '../../ports/out/cliente.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface AtualizarClienteInput {
  nome?: string;
  email?: string;
}

@Injectable()
export class AtualizarClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryPort) {}

  async execute(id: string, data: AtualizarClienteInput): Promise<Cliente> {
    const existente = await this.clienteRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainException(`Cliente com ID ${id} não encontrado`);
    }
    return this.clienteRepository.atualizar(id, data);
  }
}
