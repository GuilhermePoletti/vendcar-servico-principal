import { ClienteController } from '../../src/infrastructure/adapters/in/cliente.controller';
import { CriarClienteUseCase } from '../../src/application/use-cases/cliente/criar-cliente.use-case';
import { BuscarClientePorCpfUseCase } from '../../src/application/use-cases/cliente/buscar-cliente-por-cpf.use-case';
import { ListarClientesUseCase } from '../../src/application/use-cases/cliente/listar-clientes.use-case';
import { AtualizarClienteUseCase } from '../../src/application/use-cases/cliente/atualizar-cliente.use-case';
import { DeletarClienteUseCase } from '../../src/application/use-cases/cliente/deletar-cliente.use-case';
import { Cliente } from '../../src/domain/entities/cliente.entity';
import { DomainException } from '../../src/domain/exceptions/domain.exception';
import { NotFoundException } from '@nestjs/common';

const makeCliente = () => new Cliente({ nome: 'João', cpf: '52998224725', email: 'joao@email.com' });

const makeMocks = () => ({
  criarCliente: { execute: jest.fn() } as any as jest.Mocked<CriarClienteUseCase>,
  buscarPorCpf: { execute: jest.fn() } as any as jest.Mocked<BuscarClientePorCpfUseCase>,
  listarClientes: { execute: jest.fn() } as any as jest.Mocked<ListarClientesUseCase>,
  atualizarCliente: { execute: jest.fn() } as any as jest.Mocked<AtualizarClienteUseCase>,
  deletarCliente: { execute: jest.fn() } as any as jest.Mocked<DeletarClienteUseCase>,
});

describe('ClienteController', () => {
  let controller: ClienteController;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    mocks = makeMocks();
    controller = new ClienteController(
      mocks.criarCliente, mocks.buscarPorCpf, mocks.listarClientes,
      mocks.atualizarCliente, mocks.deletarCliente,
    );
  });

  it('deve criar um cliente', async () => {
    const cliente = makeCliente();
    mocks.criarCliente.execute.mockResolvedValue(cliente);

    const result = await controller.criar({ nome: 'João', cpf: '52998224725', email: 'joao@email.com' });

    expect(result).toEqual(cliente.toJSON());
    expect(mocks.criarCliente.execute).toHaveBeenCalledTimes(1);
  });

  it('deve listar clientes', async () => {
    mocks.listarClientes.execute.mockResolvedValue([makeCliente()]);

    const result = await controller.listar();

    expect(result).toHaveLength(1);
  });

  it('deve buscar cliente por CPF', async () => {
    const cliente = makeCliente();
    mocks.buscarPorCpf.execute.mockResolvedValue(cliente);

    const result = await controller.buscarPorCpf('52998224725');

    expect(result).toEqual(cliente.toJSON());
  });

  it('deve lançar NotFoundException quando CPF não encontrado', async () => {
    mocks.buscarPorCpf.execute.mockRejectedValue(new DomainException('não encontrado'));

    await expect(controller.buscarPorCpf('99999999999')).rejects.toThrow(NotFoundException);
  });

  it('deve atualizar um cliente', async () => {
    const cliente = makeCliente();
    mocks.atualizarCliente.execute.mockResolvedValue(cliente);

    const result = await controller.atualizar('uuid', { nome: 'Novo Nome' });

    expect(result).toEqual(cliente.toJSON());
  });

  it('deve deletar um cliente', async () => {
    mocks.deletarCliente.execute.mockResolvedValue();

    await controller.deletar('uuid');

    expect(mocks.deletarCliente.execute).toHaveBeenCalledWith('uuid');
  });

  // ─── Branch coverage ────────────────────────

  it('deve propagar erro genérico no buscarPorCpf', async () => {
    mocks.buscarPorCpf.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.buscarPorCpf('52998224725')).rejects.toThrow('DB error');
  });

  it('deve lançar NotFoundException ao atualizar cliente inexistente', async () => {
    mocks.atualizarCliente.execute.mockRejectedValue(new DomainException('não encontrado'));

    await expect(controller.atualizar('uuid', { nome: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('deve propagar erro genérico no atualizar', async () => {
    mocks.atualizarCliente.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.atualizar('uuid', { nome: 'X' })).rejects.toThrow('DB error');
  });

  it('deve lançar NotFoundException ao deletar cliente inexistente', async () => {
    mocks.deletarCliente.execute.mockRejectedValue(new DomainException('não encontrado'));

    await expect(controller.deletar('uuid')).rejects.toThrow(NotFoundException);
  });

  it('deve propagar erro genérico no deletar', async () => {
    mocks.deletarCliente.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.deletar('uuid')).rejects.toThrow('DB error');
  });
});
