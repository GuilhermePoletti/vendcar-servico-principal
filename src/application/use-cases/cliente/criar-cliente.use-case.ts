import { Injectable } from '@nestjs/common';
import { Cliente } from '../../../domain/entities/cliente.entity';
import { ClienteRepositoryPort } from '../../ports/out/cliente.repository.port';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface CriarClienteInput {
  nome: string;
  cpf: string;
  email: string;
}

@Injectable()
export class CriarClienteUseCase {
  constructor(private readonly clienteRepository: ClienteRepositoryPort) {}

  async execute(input: CriarClienteInput): Promise<Cliente> {
    const existente = await this.clienteRepository.buscarPorCpf(input.cpf);
    if (existente) {
      throw new DomainException(`Já existe um cliente com o CPF ${input.cpf}`);
    }

    const cliente = new Cliente(input);
    return this.clienteRepository.salvar(cliente);
  }
}
