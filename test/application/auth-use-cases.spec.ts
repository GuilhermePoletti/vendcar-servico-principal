import { RegistrarUsuarioUseCase } from '../../src/application/use-cases/auth/registrar-usuario.use-case';
import { LoginUseCase } from '../../src/application/use-cases/auth/login.use-case';
import { UsuarioRepositoryPort } from '../../src/application/ports/out/usuario.repository.port';
import { Usuario } from '../../src/domain/entities/usuario.entity';
import { RoleUsuario } from '../../src/domain/enums/role-usuario.enum';
import { DomainException } from '../../src/domain/exceptions/domain.exception';
import * as bcrypt from 'bcrypt';

const makeUsuarioRepo = (): jest.Mocked<UsuarioRepositoryPort> => ({
  salvar: jest.fn(),
  buscarPorEmail: jest.fn(),
} as any);

const makeJwtService = () => ({
  sign: jest.fn().mockReturnValue('jwt-token-mock'),
});

describe('RegistrarUsuarioUseCase', () => {
  let useCase: RegistrarUsuarioUseCase;
  let repo: jest.Mocked<UsuarioRepositoryPort>;

  beforeEach(() => {
    repo = makeUsuarioRepo();
    useCase = new RegistrarUsuarioUseCase(repo);
  });

  it('deve registrar um novo usuário com senha hasheada', async () => {
    repo.buscarPorEmail.mockResolvedValue(null);
    repo.salvar.mockImplementation(async (u) => u);

    const result = await useCase.execute({ nome: 'Admin', email: 'admin@test.com', senha: '123456' });

    expect(repo.salvar).toHaveBeenCalledTimes(1);
    const savedUser = repo.salvar.mock.calls[0][0];
    expect(savedUser.senhaHash).not.toBe('123456');
    expect(await bcrypt.compare('123456', savedUser.senhaHash)).toBe(true);
    expect(result.nome).toBe('Admin');
  });

  it('deve lançar erro quando email já existe', async () => {
    repo.buscarPorEmail.mockResolvedValue(
      new Usuario({ nome: 'Existing', email: 'admin@test.com', senhaHash: 'h' }),
    );

    await expect(
      useCase.execute({ nome: 'Admin', email: 'admin@test.com', senha: '123456' }),
    ).rejects.toThrow('Já existe um usuário');
  });

  it('deve aceitar role customizado', async () => {
    repo.buscarPorEmail.mockResolvedValue(null);
    repo.salvar.mockImplementation(async (u) => u);

    const result = await useCase.execute({
      nome: 'Admin', email: 'a@b.com', senha: '123456', role: RoleUsuario.ADMIN,
    });

    expect(result.role).toBe(RoleUsuario.ADMIN);
  });
});

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let repo: jest.Mocked<UsuarioRepositoryPort>;
  let jwtService: ReturnType<typeof makeJwtService>;

  beforeEach(() => {
    repo = makeUsuarioRepo();
    jwtService = makeJwtService();
    useCase = new LoginUseCase(repo, jwtService as any);
  });

  it('deve retornar JWT quando credenciais são válidas', async () => {
    const hash = await bcrypt.hash('123456', 10);
    repo.buscarPorEmail.mockResolvedValue(
      new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: hash, role: RoleUsuario.ADMIN }),
    );

    const result = await useCase.execute({ email: 'admin@test.com', senha: '123456' });

    expect(result.access_token).toBe('jwt-token-mock');
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'admin@test.com', role: 'ADMIN' }),
    );
  });

  it('deve lançar erro quando email não encontrado', async () => {
    repo.buscarPorEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'inexistente@test.com', senha: '123456' }),
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('deve lançar erro quando senha é incorreta', async () => {
    const hash = await bcrypt.hash('123456', 10);
    repo.buscarPorEmail.mockResolvedValue(
      new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: hash }),
    );

    await expect(
      useCase.execute({ email: 'admin@test.com', senha: 'errada' }),
    ).rejects.toThrow('Credenciais inválidas');
  });
});
