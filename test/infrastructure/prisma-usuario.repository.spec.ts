import { PrismaUsuarioRepository } from '../../src/infrastructure/adapters/out/prisma-usuario.repository';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { Usuario } from '../../src/domain/entities/usuario.entity';
import { RoleUsuario } from '../../src/domain/enums/role-usuario.enum';

const makePrismaService = (): jest.Mocked<PrismaService> => {
  return {
    usuario: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  } as any;
};

const usuarioDb = {
  id: 'uuid-1',
  nome: 'Admin',
  email: 'admin@vendcar.com',
  senha_hash: '$2b$10$hashedvalue',
  role: 'ADMIN',
  criado_em: new Date(),
  atualizado_em: new Date(),
};

describe('PrismaUsuarioRepository', () => {
  let repository: PrismaUsuarioRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = makePrismaService();
    repository = new PrismaUsuarioRepository(prisma);
  });

  it('deve salvar um usuário', async () => {
    const usuario = new Usuario({ nome: 'Admin', email: 'admin@test.com', senhaHash: 'hash', role: RoleUsuario.ADMIN });
    (prisma.usuario.create as jest.Mock).mockResolvedValue({ ...usuarioDb, id: usuario.id });

    const result = await repository.salvar(usuario);

    expect(prisma.usuario.create).toHaveBeenCalledWith({
      data: {
        id: usuario.id,
        nome: 'Admin',
        email: 'admin@test.com',
        senha_hash: 'hash',
        role: 'ADMIN',
      },
    });
    expect(result).toBeInstanceOf(Usuario);
  });

  it('deve buscar usuário por email', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(usuarioDb);

    const result = await repository.buscarPorEmail('admin@vendcar.com');

    expect(prisma.usuario.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@vendcar.com' } });
    expect(result).toBeInstanceOf(Usuario);
    expect(result!.role).toBe(RoleUsuario.ADMIN);
  });

  it('deve retornar null quando usuário não encontrado', async () => {
    (prisma.usuario.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.buscarPorEmail('inexistente@test.com');

    expect(result).toBeNull();
  });
});
