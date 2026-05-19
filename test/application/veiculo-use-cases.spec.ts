import { CriarVeiculoUseCase } from '../../src/application/use-cases/veiculo/criar-veiculo.use-case';
import { ListarVeiculosDisponiveisUseCase } from '../../src/application/use-cases/veiculo/listar-veiculos-disponiveis.use-case';
import { ReservarVeiculoUseCase } from '../../src/application/use-cases/veiculo/reservar-veiculo.use-case';
import { VenderVeiculoUseCase } from '../../src/application/use-cases/veiculo/vender-veiculo.use-case';
import { DisponibilizarVeiculoUseCase } from '../../src/application/use-cases/veiculo/disponibilizar-veiculo.use-case';
import { AtualizarVeiculoUseCase } from '../../src/application/use-cases/veiculo/atualizar-veiculo.use-case';
import { DeletarVeiculoUseCase } from '../../src/application/use-cases/veiculo/deletar-veiculo.use-case';
import { VeiculoRepositoryPort } from '../../src/application/ports/out/veiculo.repository.port';
import { MarcaRepositoryPort } from '../../src/application/ports/out/marca.repository.port';
import { Veiculo } from '../../src/domain/entities/veiculo.entity';
import { Marca } from '../../src/domain/entities/marca.entity';
import { StatusVeiculo } from '../../src/domain/enums/status-veiculo.enum';

const marcaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const makeVeiculo = (overrides: Partial<{ status: StatusVeiculo }> = {}) =>
  new Veiculo({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000, ...overrides });

const makeMockVeiculoRepo = (): jest.Mocked<VeiculoRepositoryPort> => ({
  salvar: jest.fn(),
  buscarPorId: jest.fn(),
  listarDisponiveis: jest.fn(),
  atualizar: jest.fn(),
  deletar: jest.fn(),
} as any);

const makeMockMarcaRepo = (): jest.Mocked<MarcaRepositoryPort> => ({
  buscarPorId: jest.fn(),
  listar: jest.fn(),
} as any);

// ─────────────────────────────────────────────
// CRIAR VEÍCULO
// ─────────────────────────────────────────────

describe('CriarVeiculoUseCase', () => {
  let useCase: CriarVeiculoUseCase;
  let veiculoRepo: jest.Mocked<VeiculoRepositoryPort>;
  let marcaRepo: jest.Mocked<MarcaRepositoryPort>;

  beforeEach(() => {
    veiculoRepo = makeMockVeiculoRepo();
    marcaRepo = makeMockMarcaRepo();
    useCase = new CriarVeiculoUseCase(veiculoRepo, marcaRepo);
  });

  it('deve criar veículo quando marca existe', async () => {
    marcaRepo.buscarPorId.mockResolvedValue(new Marca({ id: marcaId, nome: 'Honda' }));
    veiculoRepo.salvar.mockImplementation(async (v) => v);

    const result = await useCase.execute({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 });

    expect(marcaRepo.buscarPorId).toHaveBeenCalledWith(marcaId);
    expect(veiculoRepo.salvar).toHaveBeenCalledTimes(1);
    expect(result.modelo).toBe('Civic');
  });

  it('deve lançar erro quando marca não existe', async () => {
    marcaRepo.buscarPorId.mockResolvedValue(null);

    await expect(
      useCase.execute({ idMarca: 'inexistente', modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 }),
    ).rejects.toThrow('Marca com ID');
  });
});

// ─────────────────────────────────────────────
// LISTAR VEÍCULOS DISPONÍVEIS
// ─────────────────────────────────────────────

describe('ListarVeiculosDisponiveisUseCase', () => {
  it('deve retornar lista de veículos disponíveis', async () => {
    const repo = makeMockVeiculoRepo();
    const useCase = new ListarVeiculosDisponiveisUseCase(repo);
    repo.listarDisponiveis.mockResolvedValue([makeVeiculo()]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(repo.listarDisponiveis).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────
// RESERVAR VEÍCULO (SAGA Lock)
// ─────────────────────────────────────────────

describe('ReservarVeiculoUseCase', () => {
  let useCase: ReservarVeiculoUseCase;
  let repo: jest.Mocked<VeiculoRepositoryPort>;

  beforeEach(() => {
    repo = makeMockVeiculoRepo();
    useCase = new ReservarVeiculoUseCase(repo);
  });

  it('deve reservar veículo DISPONIVEL', async () => {
    const veiculo = makeVeiculo();
    repo.buscarPorId.mockResolvedValue(veiculo);
    repo.atualizar.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.RESERVADO }));

    await useCase.execute(veiculo.id);

    expect(repo.buscarPorId).toHaveBeenCalledWith(veiculo.id);
    expect(repo.atualizar).toHaveBeenCalledWith(veiculo.id, { status: StatusVeiculo.RESERVADO });
  });

  it('deve lançar erro quando veículo não encontrado', async () => {
    repo.buscarPorId.mockResolvedValue(null);
    await expect(useCase.execute('inexistente')).rejects.toThrow('não encontrado');
  });

  it('deve lançar erro quando veículo já RESERVADO', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.RESERVADO }));
    await expect(useCase.execute('some-id')).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────
// VENDER VEÍCULO (SAGA Confirm)
// ─────────────────────────────────────────────

describe('VenderVeiculoUseCase', () => {
  let useCase: VenderVeiculoUseCase;
  let repo: jest.Mocked<VeiculoRepositoryPort>;

  beforeEach(() => {
    repo = makeMockVeiculoRepo();
    useCase = new VenderVeiculoUseCase(repo);
  });

  it('deve vender veículo RESERVADO', async () => {
    const veiculo = makeVeiculo({ status: StatusVeiculo.RESERVADO });
    repo.buscarPorId.mockResolvedValue(veiculo);
    repo.atualizar.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.VENDIDO }));

    await useCase.execute(veiculo.id);

    expect(repo.atualizar).toHaveBeenCalledWith(veiculo.id, { status: StatusVeiculo.VENDIDO });
  });

  it('deve lançar erro quando veículo DISPONIVEL', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo());
    await expect(useCase.execute('some-id')).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────
// DISPONIBILIZAR VEÍCULO (SAGA Cancel)
// ─────────────────────────────────────────────

describe('DisponibilizarVeiculoUseCase', () => {
  let useCase: DisponibilizarVeiculoUseCase;
  let repo: jest.Mocked<VeiculoRepositoryPort>;

  beforeEach(() => {
    repo = makeMockVeiculoRepo();
    useCase = new DisponibilizarVeiculoUseCase(repo);
  });

  it('deve disponibilizar veículo RESERVADO', async () => {
    const veiculo = makeVeiculo({ status: StatusVeiculo.RESERVADO });
    repo.buscarPorId.mockResolvedValue(veiculo);
    repo.atualizar.mockResolvedValue(makeVeiculo());

    await useCase.execute(veiculo.id);

    expect(repo.atualizar).toHaveBeenCalledWith(veiculo.id, { status: StatusVeiculo.DISPONIVEL });
  });

  it('deve lançar erro quando veículo VENDIDO', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.VENDIDO }));
    await expect(useCase.execute('some-id')).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────
// ATUALIZAR VEÍCULO
// ─────────────────────────────────────────────

describe('AtualizarVeiculoUseCase', () => {
  it('deve atualizar quando veículo existe', async () => {
    const repo = makeMockVeiculoRepo();
    const useCase = new AtualizarVeiculoUseCase(repo);
    const veiculo = makeVeiculo();
    repo.buscarPorId.mockResolvedValue(veiculo);
    repo.atualizar.mockResolvedValue(veiculo);

    await useCase.execute(veiculo.id, { cor: 'Azul' });

    expect(repo.atualizar).toHaveBeenCalledWith(veiculo.id, { cor: 'Azul' });
  });

  it('deve lançar erro quando veículo não existe', async () => {
    const repo = makeMockVeiculoRepo();
    const useCase = new AtualizarVeiculoUseCase(repo);
    repo.buscarPorId.mockResolvedValue(null);

    await expect(useCase.execute('inexistente', { cor: 'Azul' })).rejects.toThrow('não encontrado');
  });
});

// ─────────────────────────────────────────────
// DELETAR VEÍCULO
// ─────────────────────────────────────────────

describe('DeletarVeiculoUseCase', () => {
  let useCase: DeletarVeiculoUseCase;
  let repo: jest.Mocked<VeiculoRepositoryPort>;

  beforeEach(() => {
    repo = makeMockVeiculoRepo();
    useCase = new DeletarVeiculoUseCase(repo);
  });

  it('deve deletar veículo DISPONIVEL', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo());
    repo.deletar.mockResolvedValue();

    await useCase.execute('some-id');

    expect(repo.deletar).toHaveBeenCalledWith('some-id');
  });

  it('deve lançar erro quando veículo não existe', async () => {
    repo.buscarPorId.mockResolvedValue(null);
    await expect(useCase.execute('inexistente')).rejects.toThrow('não encontrado');
  });

  it('deve lançar erro quando veículo RESERVADO', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.RESERVADO }));
    await expect(useCase.execute('some-id')).rejects.toThrow('Não é possível deletar');
  });

  it('deve lançar erro quando veículo VENDIDO', async () => {
    repo.buscarPorId.mockResolvedValue(makeVeiculo({ status: StatusVeiculo.VENDIDO }));
    await expect(useCase.execute('some-id')).rejects.toThrow('Não é possível deletar');
  });
});
