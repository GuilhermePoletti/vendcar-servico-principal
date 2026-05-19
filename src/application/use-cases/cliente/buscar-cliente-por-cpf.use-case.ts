import { Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { ClienteRepositoryPort } from '../../ports/out/cliente.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class BuscarClientePorCpfUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryPort) {}

  async execute(cpf: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.buscarPorCpf(cpf);
    if (!cliente) {
      throw new DomainException(`Cliente com CPF ${cpf} não encontrado`);
    }
    return cliente;
  }
}
