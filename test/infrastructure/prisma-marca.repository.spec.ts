import { PrismaMarcaRepository } from '../../src/infrastructure/adapters/out/prisma-marca.repository';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';
import { Marca } from '../../src/domain/entities/marca.entity';

const makePrismaService = (): jest.Mocked<PrismaService> => {
  return {
    marca: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;
};

const marcaDb = {
  id: 'marca-uuid-1',
  nome: 'Toyota',
  criado_em: new Date(),
  atualizado_em: new Date(),
};

describe('PrismaMarcaRepository', () => {
  let repository: PrismaMarcaRepository;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = makePrismaService();
    repository = new PrismaMarcaRepository(prisma);
  });

  it('deve buscar marca por ID', async () => {
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue(marcaDb);

    const result = await repository.buscarPorId('marca-uuid-1');

    expect(prisma.marca.findUnique).toHaveBeenCalledWith({ where: { id: 'marca-uuid-1' } });
    expect(result).toBeInstanceOf(Marca);
    expect(result!.nome).toBe('Toyota');
  });

  it('deve retornar null quando marca não encontrada', async () => {
    (prisma.marca.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.buscarPorId('inexistente');

    expect(result).toBeNull();
  });

  it('deve listar todas as marcas', async () => {
    (prisma.marca.findMany as jest.Mock).mockResolvedValue([marcaDb, { ...marcaDb, id: 'marca-2', nome: 'Honda' }]);

    const result = await repository.listar();

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Marca);
    expect(result[1].nome).toBe('Honda');
  });
});
