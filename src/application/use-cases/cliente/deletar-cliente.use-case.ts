import { Injectable } from '@nestjs/common';
import { ClienteRepositoryPort } from '../../ports/out/cliente.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class DeletarClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryPort) {}

  async execute(id: string): Promise<void> {
    const existente = await this.clienteRepository.buscarPorId(id);
    if (!existente) {
      throw new DomainException(`Cliente com ID ${id} não encontrado`);
    }
    return this.clienteRepository.deletar(id);
  }
}
