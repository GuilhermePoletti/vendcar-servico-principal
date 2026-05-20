import { randomUUID } from 'node:crypto';
import { DomainException } from '../exceptions/domain.exception';
import { StatusVeiculo } from '../enums/status-veiculo.enum';

export interface VeiculoProps {
  id?: string;
  idMarca: string;
  modelo: string;
  ano: number;
  cor: string;
  preco: number;
  status?: StatusVeiculo;
}

export class Veiculo {
  private readonly _id: string;
  private readonly _idMarca: string;
  private readonly _modelo: string;
  private readonly _ano: number;
  private readonly _cor: string;
  private readonly _preco: number;
  private _status: StatusVeiculo;

  constructor(props: VeiculoProps) {
    this.validarIdMarca(props.idMarca);
    this.validarModelo(props.modelo);
    this.validarAno(props.ano);
    this.validarCor(props.cor);
    this.validarPreco(props.preco);

    this._id = props.id ?? randomUUID();
    this._idMarca = props.idMarca.trim();
    this._modelo = props.modelo.trim();
    this._ano = props.ano;
    this._cor = props.cor.trim();
    this._preco = props.preco;
    this._status = props.status ?? StatusVeiculo.DISPONIVEL;
  }

  get id(): string {
    return this._id;
  }

  get idMarca(): string {
    return this._idMarca;
  }

  get modelo(): string {
    return this._modelo;
  }

  get ano(): number {
    return this._ano;
  }

  get cor(): string {
    return this._cor;
  }

  get preco(): number {
    return this._preco;
  }

  get status(): StatusVeiculo {
    return this._status;
  }

  reservar(): void {
    if (this._status !== StatusVeiculo.DISPONIVEL) {
      throw new DomainException(
        `Não é possível reservar um veículo com status ${this._status}. Apenas veículos DISPONIVEL podem ser reservados.`,
      );
    }
    this._status = StatusVeiculo.RESERVADO;
  }

  vender(): void {
    if (this._status !== StatusVeiculo.RESERVADO) {
      throw new DomainException(
        `Não é possível vender um veículo com status ${this._status}. Apenas veículos RESERVADO podem ser vendidos.`,
      );
    }
    this._status = StatusVeiculo.VENDIDO;
  }

  disponibilizar(): void {
    if (this._status !== StatusVeiculo.RESERVADO) {
      throw new DomainException(
        `Não é possível disponibilizar um veículo com status ${this._status}. Apenas veículos RESERVADO podem ser disponibilizados.`,
      );
    }
    this._status = StatusVeiculo.DISPONIVEL;
  }

  private validarIdMarca(idMarca: string): void {
    if (!idMarca || idMarca.trim().length === 0) {
      throw new DomainException('ID da marca é obrigatório');
    }
  }

  private validarModelo(modelo: string): void {
    if (!modelo || modelo.trim().length < 2) {
      throw new DomainException(
        'Modelo é obrigatório e deve ter pelo menos 2 caracteres',
      );
    }
  }

  private validarAno(ano: number): void {
    if (!Number.isInteger(ano)) {
      throw new DomainException('Ano deve ser um número inteiro');
    }
    const anoMaximo = new Date().getFullYear() + 1;
    if (ano < 1886 || ano > anoMaximo) {
      throw new DomainException(
        `Ano deve estar entre 1886 e ${anoMaximo}`,
      );
    }
  }

  private validarCor(cor: string): void {
    if (!cor || cor.trim().length === 0) {
      throw new DomainException('Cor é obrigatória');
    }
  }

  private validarPreco(preco: number): void {
    if (preco <= 0) {
      throw new DomainException('Preço deve ser maior que zero');
    }
  }

  toJSON() {
    return {
      id: this.id,
      idMarca: this.idMarca,
      modelo: this.modelo,
      ano: this.ano,
      cor: this.cor,
      preco: this.preco,
      status: this.status,
    };
  }
}
