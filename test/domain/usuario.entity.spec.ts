import { Usuario } from '../../src/domain/entities/usuario.entity';
import { RoleUsuario } from '../../src/domain/enums/role-usuario.enum';
import { DomainException } from '../../src/domain/exceptions/domain.exception';

describe('Usuario Entity', () => {
  it('deve criar um usuario válido com valores padrão', () => {
    const usuario = new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: 'hashed' });

    expect(usuario.id).toBeDefined();
    expect(usuario.nome).toBe('Admin');
    expect(usuario.email).toBe('admin@test.com');
    expect(usuario.senhaHash).toBe('hashed');
    expect(usuario.role).toBe(RoleUsuario.VENDEDOR);
  });

  it('deve criar usuario com role ADMIN', () => {
    const usuario = new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: 'h', role: RoleUsuario.ADMIN });

    expect(usuario.role).toBe(RoleUsuario.ADMIN);
  });

  it('deve normalizar email para minúsculas', () => {
    const usuario = new Usuario({ nome: 'Admin', email: 'Admin@Test.COM', senhaHash: 'h' });

    expect(usuario.email).toBe('admin@test.com');
  });

  it('deve lançar erro para nome curto', () => {
    expect(() => new Usuario({ nome: 'Ab', email: 'a@b.com', senhaHash: 'h' }))
      .toThrow(DomainException);
  });

  it('deve lançar erro para email inválido', () => {
    expect(() => new Usuario({ nome: 'Admin', email: 'invalido', senhaHash: 'h' }))
      .toThrow(DomainException);
  });

  it('deve lançar erro para hash vazio', () => {
    expect(() => new Usuario({ nome: 'Admin', email: 'a@b.com', senhaHash: '' }))
      .toThrow(DomainException);
  });
});
