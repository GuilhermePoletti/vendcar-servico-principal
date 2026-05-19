import { randomUUID } from 'node:crypto';
import { DomainException } from '../exceptions/domain.exception';
import { RoleUsuario } from '../enums/role-usuario.enum';

export interface UsuarioProps {
  id?: string;
  nome: string;
  email: string;
  senhaHash: string;
  role?: RoleUsuario;
}

export class Usuario {
  private readonly _id: string;
  private readonly _nome: string;
  private readonly _email: string;
  private readonly _senhaHash: string;
  private readonly _role: RoleUsuario;

  constructor(props: UsuarioProps) {
    this.validarNome(props.nome);
    this.validarEmail(props.email);
    this.validarSenhaHash(props.senhaHash);

    this._id = props.id ?? randomUUID();
    this._nome = props.nome.trim();
    this._email = props.email.trim().toLowerCase();
    this._senhaHash = props.senhaHash;
    this._role = props.role ?? RoleUsuario.VENDEDOR;
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get senhaHash(): string { return this._senhaHash; }
  get role(): RoleUsuario { return this._role; }

  private validarNome(nome: string): void {
    if (!nome || nome.trim().length < 3) {
      throw new DomainException('Nome é obrigatório e deve ter pelo menos 3 caracteres');
    }
  }

  private validarEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new DomainException('E-mail inválido');
    }
  }

  private validarSenhaHash(hash: string): void {
    if (!hash || hash.length === 0) {
      throw new DomainException('Hash da senha é obrigatório');
    }
  }
}
