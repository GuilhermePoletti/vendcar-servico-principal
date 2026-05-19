import { CriarClienteUseCase } from '../../src/application/use-cases/cliente/criar-cliente.use-case';
import { BuscarClientePorCpfUseCase } from '../../src/application/use-cases/cliente/buscar-cliente-por-cpf.use-case';
import { ListarClientesUseCase } from '../../src/application/use-cases/cliente/listar-clientes.use-case';
import { AtualizarClienteUseCase } from '../../src/application/use-cases/cliente/atualizar-cliente.use-case';
import { DeletarClienteUseCase } from '../../src/application/use-cases/cliente/deletar-cliente.use-case';
import { ClienteRepositoryPort } from '../../src/application/ports/out/cliente.repository.port';
import { Cliente } from '../../src/domain/entities/cliente.entity';

const makeCliente = (overrides = {}) =>
  new Cliente({ nome: 'João', cpf: '52998224725', email: 'joao@email.com', ...overrides });

const makeMockRepo = (): jest.Mocked<ClienteRepositoryPort> => ({
  salvar: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorCpf: jest.fn(),
  listar: jest.fn(),
  atualizar: jest.fn(),
  deletar: jest.fn(),
} as any);

describe('CriarClienteUseCase', () => {
  let useCase: CriarClienteUseCase;
  let repo: jest.Mocked<ClienteRepositoryPort>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new CriarClienteUseCase(repo);
  });

  it('deve criar e salvar um cliente quando CPF não existe', async () => {
    repo.buscarPorCpf.mockResolvedValue(null);
    repo.salvar.mockImplementation(async (c) => c);

    const result = await useCase.execute({ nome: 'João', cpf: '52998224725', email: 'joao@email.com' });

    expect(repo.buscarPorCpf).toHaveBeenCalledWith('52998224725');
    expect(repo.salvar).toHaveBeenCalledTimes(1);
    expect(result.nome).toBe('João');
  });

  it('deve lançar erro quando CPF já existe', async () => {
    repo.buscarPorCpf.mockResolvedValue(makeCliente());

    await expect(
      useCase.execute({ nome: 'Maria', cpf: '52998224725', email: 'maria@email.com' }),
    ).rejects.toThrow('Já existe um cliente com o CPF');
  });
});

describe('BuscarClientePorCpfUseCase', () => {
  let useCase: BuscarClientePorCpfUseCase;
  let repo: jest.Mocked<ClienteRepositoryPort>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new BuscarClientePorCpfUseCase(repo);
  });

  it('deve retornar cliente quando CPF existe', async () => {
    const cliente = makeCliente();
    repo.buscarPorCpf.mockResolvedValue(cliente);

    const result = await useCase.execute('52998224725');

    expect(result).toBe(cliente);
    expect(repo.buscarPorCpf).toHaveBeenCalledWith('52998224725');
  });

  it('deve lançar erro quando CPF não existe', async () => {
    repo.buscarPorCpf.mockResolvedValue(null);

    await expect(useCase.execute('99999999999')).rejects.toThrow('não encontrado');
  });
});

describe('ListarClientesUseCase', () => {
  it('deve retornar lista de clientes', async () => {
    const repo = makeMockRepo();
    const useCase = new ListarClientesUseCase(repo);
    const clientes = [makeCliente(), makeCliente({ cpf: '11111111111' })];
    repo.listar.mockResolvedValue(clientes);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(repo.listar).toHaveBeenCalledTimes(1);
  });
});

describe('AtualizarClienteUseCase', () => {
  let useCase: AtualizarClienteUseCase;
  let repo: jest.Mocked<ClienteRepositoryPort>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new AtualizarClienteUseCase(repo);
  });

  it('deve atualizar quando cliente existe', async () => {
    const cliente = makeCliente();
    repo.buscarPorId.mockResolvedValue(cliente);
    repo.atualizar.mockResolvedValue(makeCliente({ nome: 'Novo Nome' }));

    await useCase.execute(cliente.id, { nome: 'Novo Nome' });

    expect(repo.buscarPorId).toHaveBeenCalledWith(cliente.id);
    expect(repo.atualizar).toHaveBeenCalledWith(cliente.id, { nome: 'Novo Nome' });
  });

  it('deve lançar erro quando cliente não existe', async () => {
    repo.buscarPorId.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente', { nome: 'X' })).rejects.toThrow('não encontrado');
  });
});

describe('DeletarClienteUseCase', () => {
  let useCase: DeletarClienteUseCase;
  let repo: jest.Mocked<ClienteRepositoryPort>;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new DeletarClienteUseCase(repo);
  });

  it('deve deletar quando cliente existe', async () => {
    repo.buscarPorId.mockResolvedValue(makeCliente());
    repo.deletar.mockResolvedValue();

    await useCase.execute('some-id');

    expect(repo.deletar).toHaveBeenCalledWith('some-id');
  });

  it('deve lançar erro quando cliente não existe', async () => {
    repo.buscarPorId.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow('não encontrado');
  });
});
