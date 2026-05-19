import {
  Controller, Post, Body, HttpCode, HttpStatus,
  BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrarUsuarioUseCase } from '../../../application/use-cases/auth/registrar-usuario.use-case';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { RegistrarUsuarioDto, LoginDto } from './dto/auth.dto';
import { Public } from '../../auth/public.decorator';
import { DomainException } from '../../../domain/exceptions/domain.exception';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrarUsuario: RegistrarUsuarioUseCase,
    private readonly login: LoginUseCase,
  ) {}

  @Public()
  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado' })
  @ApiResponse({ status: 400, description: 'Email já existente ou dados inválidos' })
  async registrar(@Body() dto: RegistrarUsuarioDto) {
    try {
      const usuario = await this.registrarUsuario.execute(dto);
      return { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role };
    } catch (error) {
      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login — retorna JWT' })
  @ApiResponse({ status: 200, description: 'Token JWT gerado' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async fazerLogin(@Body() dto: LoginDto) {
    try {
      return await this.login.execute(dto);
    } catch (error) {
      if (error instanceof DomainException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
