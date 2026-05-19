import { AuthController } from '../../src/infrastructure/adapters/in/auth.controller';
import { RegistrarUsuarioUseCase } from '../../src/application/use-cases/auth/registrar-usuario.use-case';
import { LoginUseCase } from '../../src/application/use-cases/auth/login.use-case';
import { Usuario } from '../../src/domain/entities/usuario.entity';
import { RoleUsuario } from '../../src/domain/enums/role-usuario.enum';
import { DomainException } from '../../src/domain/exceptions/domain.exception';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

const makeMocks = () => ({
  registrarUsuario: { execute: jest.fn() } as any,
  login: { execute: jest.fn() } as any,
});

describe('AuthController', () => {
  let controller: AuthController;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    mocks = makeMocks();
    controller = new AuthController(mocks.registrarUsuario, mocks.login);
  });

  // ─── Registro ──────────────────────────────

  it('deve registrar um usuário e retornar dados (sem hash)', async () => {
    const usuario = new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: 'h', role: RoleUsuario.ADMIN });
    mocks.registrarUsuario.execute.mockResolvedValue(usuario);

    const result = await controller.registrar({ nome: 'Admin', email: 'admin@test.com', senha: '123456' });

    expect(result).toEqual({
      id: usuario.id,
      nome: 'Admin',
      email: 'admin@test.com',
      role: 'ADMIN',
    });
  });

  it('deve lançar BadRequestException quando email duplicado', async () => {
    mocks.registrarUsuario.execute.mockRejectedValue(new DomainException('Já existe'));

    await expect(
      controller.registrar({ nome: 'Admin', email: 'dup@test.com', senha: '123456' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve propagar erro genérico no registro', async () => {
    mocks.registrarUsuario.execute.mockRejectedValue(new Error('DB error'));

    await expect(
      controller.registrar({ nome: 'Admin', email: 'a@b.com', senha: '123456' }),
    ).rejects.toThrow('DB error');
  });

  // ─── Login ─────────────────────────────────

  it('deve retornar token JWT no login', async () => {
    mocks.login.execute.mockResolvedValue({ access_token: 'jwt-123' });

    const result = await controller.fazerLogin({ email: 'admin@test.com', senha: '123456' });

    expect(result.access_token).toBe('jwt-123');
  });

  it('deve lançar UnauthorizedException com credenciais inválidas', async () => {
    mocks.login.execute.mockRejectedValue(new DomainException('Credenciais inválidas'));

    await expect(
      controller.fazerLogin({ email: 'admin@test.com', senha: 'errada' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve propagar erro genérico no login', async () => {
    mocks.login.execute.mockRejectedValue(new Error('DB error'));

    await expect(
      controller.fazerLogin({ email: 'a@b.com', senha: '123456' }),
    ).rejects.toThrow('DB error');
  });
});
