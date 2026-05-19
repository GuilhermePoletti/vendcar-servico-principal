import { randomUUID } from 'node:crypto';
import { DomainException } from '../exceptions/domain.exception';

export interface MarcaProps {
  id?: string;
  nome: string;
}

export class Marca {
  private readonly _id: string;
  private readonly _nome: string;

  constructor(props: MarcaProps) {
    this.validarNome(props.nome);

    this._id = props.id ?? randomUUID();
    this._nome = props.nome.trim();
  }

  get id(): string {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length < 2) {
      throw new DomainException(
        'Nome da marca é obrigatório e deve ter pelo menos 2 caracteres',
      );
    }
  }
}
