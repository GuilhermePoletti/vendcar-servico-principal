import { VeiculoController } from '../../src/infrastructure/adapters/in/veiculo.controller';
import { CriarVeiculoUseCase } from '../../src/application/use-cases/veiculo/criar-veiculo.use-case';
import { ListarVeiculosDisponiveisUseCase } from '../../src/application/use-cases/veiculo/listar-veiculos-disponiveis.use-case';
import { AtualizarVeiculoUseCase } from '../../src/application/use-cases/veiculo/atualizar-veiculo.use-case';
import { DeletarVeiculoUseCase } from '../../src/application/use-cases/veiculo/deletar-veiculo.use-case';
import { ReservarVeiculoUseCase } from '../../src/application/use-cases/veiculo/reservar-veiculo.use-case';
import { VenderVeiculoUseCase } from '../../src/application/use-cases/veiculo/vender-veiculo.use-case';
import { DisponibilizarVeiculoUseCase } from '../../src/application/use-cases/veiculo/disponibilizar-veiculo.use-case';
import { Veiculo } from '../../src/domain/entities/veiculo.entity';
import { DomainException } from '../../src/domain/exceptions/domain.exception';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const marcaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const makeVeiculo = () => new Veiculo({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 });

const makeMocks = () => ({
  criarVeiculo: { execute: jest.fn() } as any,
  listarDisponiveis: { execute: jest.fn() } as any,
  atualizarVeiculo: { execute: jest.fn() } as any,
  deletarVeiculo: { execute: jest.fn() } as any,
  reservarVeiculo: { execute: jest.fn() } as any,
  venderVeiculo: { execute: jest.fn() } as any,
  disponibilizarVeiculo: { execute: jest.fn() } as any,
});

describe('VeiculoController', () => {
  let controller: VeiculoController;
  let mocks: ReturnType<typeof makeMocks>;

  beforeEach(() => {
    mocks = makeMocks();
    controller = new VeiculoController(
      mocks.criarVeiculo, mocks.listarDisponiveis,
      mocks.atualizarVeiculo, mocks.deletarVeiculo,
      mocks.reservarVeiculo, mocks.venderVeiculo, mocks.disponibilizarVeiculo,
    );
  });

  it('deve criar veículo', async () => {
    const veiculo = makeVeiculo();
    mocks.criarVeiculo.execute.mockResolvedValue(veiculo);

    const result = await controller.criar({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 });

    expect(result).toEqual(veiculo.toJSON());
  });

  it('deve lançar BadRequestException quando marca não existe', async () => {
    mocks.criarVeiculo.execute.mockRejectedValue(new DomainException('Marca não encontrada'));

    await expect(
      controller.criar({ idMarca: 'invalid', modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve listar veículos disponíveis', async () => {
    mocks.listarDisponiveis.execute.mockResolvedValue([makeVeiculo()]);

    const result = await controller.listar();

    expect(result).toHaveLength(1);
  });

  it('deve atualizar veículo', async () => {
    const veiculo = makeVeiculo();
    mocks.atualizarVeiculo.execute.mockResolvedValue(veiculo);

    const result = await controller.atualizar('uuid', { cor: 'Azul' });

    expect(result).toEqual(veiculo.toJSON());
  });

  it('deve deletar veículo', async () => {
    mocks.deletarVeiculo.execute.mockResolvedValue();

    await controller.deletar('uuid');

    expect(mocks.deletarVeiculo.execute).toHaveBeenCalledWith('uuid');
  });

  it('deve lançar BadRequestException ao deletar veículo reservado', async () => {
    mocks.deletarVeiculo.execute.mockRejectedValue(new DomainException('Não é possível deletar'));

    await expect(controller.deletar('uuid')).rejects.toThrow(BadRequestException);
  });

  it('deve reservar veículo (SAGA)', async () => {
    const veiculo = makeVeiculo();
    mocks.reservarVeiculo.execute.mockResolvedValue(veiculo);

    const result = await controller.reservar('uuid');

    expect(result).toBe(veiculo);
  });

  it('deve vender veículo (SAGA)', async () => {
    const veiculo = makeVeiculo();
    mocks.venderVeiculo.execute.mockResolvedValue(veiculo);

    const result = await controller.vender('uuid');

    expect(result).toBe(veiculo);
  });

  it('deve disponibilizar veículo (SAGA)', async () => {
    const veiculo = makeVeiculo();
    mocks.disponibilizarVeiculo.execute.mockResolvedValue(veiculo);

    const result = await controller.disponibilizar('uuid');

    expect(result).toBe(veiculo);
  });

  it('deve lançar BadRequestException na reserva com erro de domínio', async () => {
    mocks.reservarVeiculo.execute.mockRejectedValue(new DomainException('Não disponível'));

    await expect(controller.reservar('uuid')).rejects.toThrow(BadRequestException);
  });

  // ─────────────────────────────────────────────
  // Cobertura dos branches "throw error" (non-DomainException)
  // ─────────────────────────────────────────────

  it('deve propagar erro genérico no criar', async () => {
    mocks.criarVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(
      controller.criar({ idMarca: marcaId, modelo: 'Civic', ano: 2024, cor: 'Prata', preco: 135000 }),
    ).rejects.toThrow('DB error');
  });

  it('deve propagar erro genérico no atualizar', async () => {
    mocks.atualizarVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.atualizar('uuid', { cor: 'Azul' })).rejects.toThrow('DB error');
  });

  it('deve lançar NotFoundException ao atualizar veículo inexistente', async () => {
    mocks.atualizarVeiculo.execute.mockRejectedValue(new DomainException('não encontrado'));

    await expect(controller.atualizar('uuid', { cor: 'Azul' })).rejects.toThrow(NotFoundException);
  });

  it('deve lançar NotFoundException ao deletar veículo inexistente', async () => {
    mocks.deletarVeiculo.execute.mockRejectedValue(new DomainException('não encontrado'));

    await expect(controller.deletar('uuid')).rejects.toThrow(NotFoundException);
  });

  it('deve propagar erro genérico no deletar', async () => {
    mocks.deletarVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.deletar('uuid')).rejects.toThrow('DB error');
  });

  it('deve propagar erro genérico no reservar', async () => {
    mocks.reservarVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.reservar('uuid')).rejects.toThrow('DB error');
  });

  it('deve lançar BadRequestException na venda com erro de domínio', async () => {
    mocks.venderVeiculo.execute.mockRejectedValue(new DomainException('Não reservado'));

    await expect(controller.vender('uuid')).rejects.toThrow(BadRequestException);
  });

  it('deve propagar erro genérico no vender', async () => {
    mocks.venderVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.vender('uuid')).rejects.toThrow('DB error');
  });

  it('deve lançar BadRequestException na disponibilização com erro de domínio', async () => {
    mocks.disponibilizarVeiculo.execute.mockRejectedValue(new DomainException('Não reservado'));

    await expect(controller.disponibilizar('uuid')).rejects.toThrow(BadRequestException);
  });

  it('deve propagar erro genérico no disponibilizar', async () => {
    mocks.disponibilizarVeiculo.execute.mockRejectedValue(new Error('DB error'));

    await expect(controller.disponibilizar('uuid')).rejects.toThrow('DB error');
  });
});
