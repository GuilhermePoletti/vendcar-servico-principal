import {
  Controller, Get, Post, Put, Delete,
  Param, Body, HttpCode, HttpStatus, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CriarClienteUseCase } from '../../../application/use-cases/cliente/criar-cliente.use-case';
import { BuscarClientePorCpfUseCase } from '../../../application/use-cases/cliente/buscar-cliente-por-cpf.use-case';
import { ListarClientesUseCase } from '../../../application/use-cases/cliente/listar-clientes.use-case';
import { AtualizarClienteUseCase } from '../../../application/use-cases/cliente/atualizar-cliente.use-case';
import { DeletarClienteUseCase } from '../../../application/use-cases/cliente/deletar-cliente.use-case';
import { CriarClienteDto, AtualizarClienteDto } from './dto/cliente.dto';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { Public } from '../../auth/public.decorator';

@ApiTags('Clientes')
@Controller('clientes')
export class ClienteController {
  constructor(
    private readonly criarCliente: CriarClienteUseCase,
    private readonly buscarClientePorCpf: BuscarClientePorCpfUseCase,
    private readonly listarClientes: ListarClientesUseCase,
    private readonly atualizarCliente: AtualizarClienteUseCase,
    private readonly deletarCliente: DeletarClienteUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou CPF duplicado' })
  async criar(@Body() dto: CriarClienteDto) {
    return this.criarCliente.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  async listar() {
    return this.listarClientes.execute();
  }

  @Public()
  @Get('cpf/:cpf')
  @ApiOperation({ summary: 'Buscar cliente por CPF' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async buscarPorCpf(@Param('cpf') cpf: string) {
    try {
      return await this.buscarClientePorCpf.execute(cpf);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados do cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async atualizar(@Param('id') id: string, @Body() dto: AtualizarClienteDto) {
    try {
      return await this.atualizarCliente.execute(id, dto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar cliente' })
  @ApiResponse({ status: 204, description: 'Cliente deletado' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async deletar(@Param('id') id: string) {
    try {
      await this.deletarCliente.execute(id);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
