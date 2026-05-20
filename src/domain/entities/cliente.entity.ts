import { randomUUID } from 'node:crypto';
import { DomainException } from '../exceptions/domain.exception';

export interface ClienteProps {
  id?: string;
  nome: string;
  cpf: string;
  email: string;
}

export class Cliente {
  private readonly _id: string;
  private readonly _nome: string;
  private readonly _cpf: string;
  private readonly _email: string;

  constructor(props: ClienteProps) {
    this.validarNome(props.nome);
    this.validarCpf(props.cpf);
    this.validarEmail(props.email);

    this._id = props.id ?? randomUUID();
    this._nome = props.nome.trim();
    this._cpf = props.cpf;
    this._email = props.email;
  }

  get id(): string {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get cpf(): string {
    return this._cpf;
  }

  get email(): string {
    return this._email;
  }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length < 3) {
      throw new DomainException(
        'Nome é obrigatório e deve ter pelo menos 3 caracteres',
      );
    }
  }

  private validarCpf(cpf: string): void {
    if (!cpf || !/^\d{11}$/.test(cpf)) {
      throw new DomainException(
        'CPF deve conter exatamente 11 dígitos numéricos',
      );
    }
  }

  private validarEmail(email: string): void {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainException('Email deve ter um formato válido');
    }
  }

  toJSON() {
    return {
      id: this.id,
      nome: this.nome,
      cpf: this.cpf,
      email: this.email,
    };
  }
}
