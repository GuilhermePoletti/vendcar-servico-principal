import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsEnum } from 'class-validator';
import { RoleUsuario } from '../../../../domain/enums/role-usuario.enum';

export class RegistrarUsuarioDto {
  @ApiProperty({ example: 'João Vendedor' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: 'joao@vendcar.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  senha: string;

  @ApiPropertyOptional({ enum: RoleUsuario, default: RoleUsuario.VENDEDOR })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@vendcar.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  senha: string;
}
