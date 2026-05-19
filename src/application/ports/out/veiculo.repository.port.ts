import { Veiculo } from '../../../domain/entities/veiculo.entity';
import { StatusVeiculo } from '../../../domain/enums/status-veiculo.enum';

export abstract class VeiculoRepositoryPort {
  abstract salvar(veiculo: Veiculo): Promise<Veiculo>;
  abstract buscarPorId(id: string): Promise<Veiculo | null>;
  abstract listarDisponiveis(): Promise<Veiculo[]>;
  abstract atualizar(id: string, data: { modelo?: string; ano?: number; cor?: string; preco?: number; status?: StatusVeiculo }): Promise<Veiculo>;
  abstract deletar(id: string): Promise<void>;
}
