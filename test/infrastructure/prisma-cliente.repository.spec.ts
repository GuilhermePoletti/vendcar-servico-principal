import { PrismaClienteRepository } from '../../src/infrastructure/adapters/out/prisma-cliente.repository';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { Cliente } from '../../src/domain/entities/cliente.entity';

const makePrismaService = (): jest.Mocked<PrismaService> => {
  return {
    cliente: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
};

const clienteDb = {
  id: 'uuid-1',
  nome: 'João',
  cpf: '52998224725',
  email: 'joao@email.com',
  criado_em: new Date(),
  atualizado_em: new Date(),
};

describe('PrismaClienteRepository', () => {
  let repository: PrismaClienteRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = makePrismaService();
    repository = new PrismaClienteRepository(prisma);
  });

  it('deve salvar um cliente', async () => {
    const cliente = new Cliente({ nome: 'João', cpf: '52998224725', email: 'joao@email.com' });
    (prisma.cliente.create as jest.Mock).mockResolvedValue({ ...clienteDb, id: cliente.id });

    const result = await repository.salvar(cliente);

    expect(prisma.cliente.create).toHaveBeenCalledWith({
      data: {
        id: cliente.id,
        nome: 'João',
        cpf: '52998224725',
        email: 'joao@email.com',
      },
    });
    expect(result).toBeInstanceOf(Cliente);
    expect(result.nome).toBe('João');
  });

  it('deve buscar cliente por ID', async () => {
    (prisma.cliente.findUnique as jest.Mock).mockResolvedValue(clienteDb);

    const result = await repository.buscarPorId('uuid-1');

    expect(prisma.cliente.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    expect(result).toBeInstanceOf(Cliente);
    expect(result!.id).toBe('uuid-1');
  });

  it('deve retornar null quando cliente não encontrado por ID', async () => {
    (prisma.cliente.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.buscarPorId('inexistente');

    expect(result).toBeNull();
  });

  it('deve buscar cliente por CPF', async () => {
    (prisma.cliente.findUnique as jest.Mock).mockResolvedValue(clienteDb);

    const result = await repository.buscarPorCpf('52998224725');

    expect(prisma.cliente.findUnique).toHaveBeenCalledWith({ where: { cpf: '52998224725' } });
    expect(result).toBeInstanceOf(Cliente);
  });

  it('deve listar todos os clientes', async () => {
    (prisma.cliente.findMany as jest.Mock).mockResolvedValue([clienteDb]);

    const result = await repository.listar();

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Cliente);
  });

  it('deve atualizar um cliente', async () => {
    (prisma.cliente.update as jest.Mock).mockResolvedValue({ ...clienteDb, nome: 'Novo Nome' });

    const result = await repository.atualizar('uuid-1', { nome: 'Novo Nome' });

    expect(prisma.cliente.update).toHaveBeenCalledWith({
      where: { id: 'uuid-1' },
      data: { nome: 'Novo Nome' },
    });
    expect(result).toBeInstanceOf(Cliente);
    expect(result.nome).toBe('Novo Nome');
  });

  it('deve deletar um cliente', async () => {
    (prisma.cliente.delete as jest.Mock).mockResolvedValue(clienteDb);

    await repository.deletar('uuid-1');

    expect(prisma.cliente.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
  });
});
