import { Cliente } from '../../../domain/entities/cliente.entity';

export abstract class ClienteRepositoryPort {
  abstract salvar(cliente: Cliente): Promise<Cliente>;
  abstract buscarPorId(id: string): Promise<Cliente | null>;
  abstract buscarPorCpf(cpf: string): Promise<Cliente | null>;
  abstract listar(): Promise<Cliente[]>;
  abstract atualizar(id: string, data: { nome?: string; email?: string }): Promise<Cliente>;
  abstract deletar(id: string): Promise<void>;
}
