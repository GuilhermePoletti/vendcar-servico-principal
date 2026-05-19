import { PrismaVeiculoRepository } from '../../src/infrastructure/adapters/out/prisma-veiculo.repository';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { Veiculo } from '../../src/domain/entities/veiculo.entity';
import { StatusVeiculo } from '../../src/domain/enums/status-veiculo.enum';
import { Decimal } from '@prisma/client/runtime/library';

const makePrismaService = (): jest.Mocked<PrismaService> => {
  return {
    veiculo: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;
};

const marcaId = 'marca-uuid-1';

const veiculoDb = {
  id: 'veiculo-uuid-1',
  id_marca: marcaId,
  modelo: 'Civic',
  ano: 2024,
  cor: 'Prata',
  preco: new Decimal('135000.00'),
  status: 'DISPONIVEL' as const,
  criado_em: new Date(),
  atualizado_em: new Date(),
};

describe('PrismaVeiculoRepository', () => {
  let repository: PrismaVeiculoRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = makePrismaService();
    repository = new PrismaVeiculoRepository(prisma);
  });

  it('deve salvar um veículo', async () => {
    const veiculo = new Veiculo({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 });
    (prisma.veiculo.create as jest.Mock).mockResolvedValue({ ...veiculoDb, id: veiculo.id });

    const result = await repository.salvar(veiculo);

    expect(prisma.veiculo.create).toHaveBeenCalledWith({
      data: {
        id: veiculo.id,
        id_marca: marcaId,
        modelo: 'Civic',
        ano: 2024,
        cor: 'Prata',
        preco: 135000,
        status: 'DISPONIVEL',
      },
    });
    expect(result).toBeInstanceOf(Veiculo);
    expect(result.modelo).toBe('Civic');
  });

  it('deve buscar veículo por ID', async () => {
    (prisma.veiculo.findUnique as jest.Mock).mockResolvedValue(veiculoDb);

    const result = await repository.buscarPorId('veiculo-uuid-1');

    expect(prisma.veiculo.findUnique).toHaveBeenCalledWith({ where: { id: 'veiculo-uuid-1' } });
    expect(result).toBeInstanceOf(Veiculo);
    expect(result!.modelo).toBe('Civic');
    expect(result!.preco).toBe(135000);
  });

  it('deve retornar null quando veículo não encontrado', async () => {
    (prisma.veiculo.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.buscarPorId('inexistente');

    expect(result).toBeNull();
  });

  it('deve listar veículos disponíveis ordenados por preço ASC', async () => {
    (prisma.veiculo.findMany as jest.Mock).mockResolvedValue([veiculoDb]);

    const result = await repository.listarDisponiveis();

    expect(prisma.veiculo.findMany).toHaveBeenCalledWith({
      where: { status: 'DISPONIVEL' },
      orderBy: { preco: 'asc' },
    });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Veiculo);
  });

  it('deve atualizar um veículo', async () => {
    (prisma.veiculo.update as jest.Mock).mockResolvedValue({
      ...veiculoDb,
      status: 'RESERVADO',
    });

    const result = await repository.atualizar('veiculo-uuid-1', { status: StatusVeiculo.RESERVADO });

    expect(prisma.veiculo.update).toHaveBeenCalledWith({
      where: { id: 'veiculo-uuid-1' },
      data: { status: 'RESERVADO' },
    });
    expect(result).toBeInstanceOf(Veiculo);
  });

  it('deve deletar um veículo', async () => {
    (prisma.veiculo.delete as jest.Mock).mockResolvedValue(veiculoDb);

    await repository.deletar('veiculo-uuid-1');

    expect(prisma.veiculo.delete).toHaveBeenCalledWith({ where: { id: 'veiculo-uuid-1' } });
  });

  it('deve converter Decimal do Prisma para number no domínio', async () => {
    (prisma.veiculo.findUnique as jest.Mock).mockResolvedValue({
      ...veiculoDb,
      preco: new Decimal('99999.99'),
    });

    const result = await repository.buscarPorId('veiculo-uuid-1');

    expect(typeof result!.preco).toBe('number');
    expect(result!.preco).toBe(99999.99);
  });
});
