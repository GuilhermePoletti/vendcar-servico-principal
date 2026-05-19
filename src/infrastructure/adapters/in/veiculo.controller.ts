import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, HttpCode, HttpStatus, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CriarVeiculoUseCase } from '../../../application/use-cases/veiculo/criar-veiculo.use-case';
import { ListarVeiculosDisponiveisUseCase } from '../../../application/use-cases/veiculo/listar-veiculos-disponiveis.use-case';
import { AtualizarVeiculoUseCase } from '../../../application/use-cases/veiculo/atualizar-veiculo.use-case';
import { DeletarVeiculoUseCase } from '../../../application/use-cases/veiculo/deletar-veiculo.use-case';
import { ReservarVeiculoUseCase } from '../../../application/use-cases/veiculo/reservar-veiculo.use-case';
import { VenderVeiculoUseCase } from '../../../application/use-cases/veiculo/vender-veiculo.use-case';
import { DisponibilizarVeiculoUseCase } from '../../../application/use-cases/veiculo/disponibilizar-veiculo.use-case';
import { CriarVeiculoDto, AtualizarVeiculoDto } from './dto/veiculo.dto';
import { DomainException } from '../../../domain/exceptions/domain.exception';

@ApiTags('Veículos')
@Controller('veiculos')
export class VeiculoController {
  constructor(
    private readonly criarVeiculo: CriarVeiculoUseCase,
    private readonly listarDisponiveis: ListarVeiculosDisponiveisUseCase,
    private readonly atualizarVeiculo: AtualizarVeiculoUseCase,
    private readonly deletarVeiculo: DeletarVeiculoUseCase,
    private readonly reservarVeiculo: ReservarVeiculoUseCase,
    private readonly venderVeiculo: VenderVeiculoUseCase,
    private readonly disponibilizarVeiculo: DisponibilizarVeiculoUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo cadastrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou marca não encontrada' })
  async criar(@Body() dto: CriarVeiculoDto) {
    try {
      return await this.criarVeiculo.execute(dto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos disponíveis (ordenado por preço ↑)' })
  @ApiResponse({ status: 200, description: 'Lista de veículos disponíveis' })
  async listar() {
    return this.listarDisponiveis.execute();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados do veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarVeiculoDto) {
    try {
      return await this.atualizarVeiculo.execute(id, dto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar veículo' })
  @ApiResponse({ status: 204, description: 'Veículo deletado' })
  @ApiResponse({ status: 400, description: 'Veículo reservado ou vendido' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async deletar(@Param('id') id: string) {
    try {
      await this.deletarVeiculo.execute(id);
    } catch (error) {
      if (error instanceof DomainException) {
        if (error.message.includes('Não é possível deletar')) {
          throw new BadRequestException(error.message);
        }
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  // ENDPOINTS SAGA (usados pelo Serviço de Vendas via HTTP)
  // ─────────────────────────────────────────────

  @Patch(':id/reservar')
  @ApiOperation({ summary: 'Reservar veículo (SAGA Lock)' })
  @ApiResponse({ status: 200, description: 'Veículo reservado' })
  @ApiResponse({ status: 400, description: 'Veículo não disponível' })
  async reservar(@Param('id') id: string) {
    try {
      return await this.reservarVeiculo.execute(id);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Patch(':id/vender')
  @ApiOperation({ summary: 'Confirmar venda (SAGA Confirm)' })
  @ApiResponse({ status: 200, description: 'Venda confirmada' })
  @ApiResponse({ status: 400, description: 'Veículo não reservado' })
  async vender(@Param('id') id: string) {
    try {
      return await this.venderVeiculo.execute(id);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Patch(':id/disponibilizar')
  @ApiOperation({ summary: 'Cancelar reserva (SAGA Cancel)' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada' })
  @ApiResponse({ status: 400, description: 'Veículo não reservado' })
  async disponibilizar(@Param('id') id: string) {
    try {
      return await this.disponibilizarVeiculo.execute(id);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
