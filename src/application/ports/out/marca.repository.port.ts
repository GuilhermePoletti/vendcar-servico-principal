import { Marca } from '../../../domain/entities/marca.entity';

export abstract class MarcaRepositoryPort {
  abstract buscarPorId(id: string): Promise<Marca | null>;
  abstract listar(): Promise<Marca[]>;
}
