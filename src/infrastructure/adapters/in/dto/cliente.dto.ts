import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';

export class CriarClienteDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do cliente' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: '52998224725', description: 'CPF com 11 dígitos numéricos' })
  @IsString()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter apenas dígitos numéricos' })
  cpf: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail do cliente' })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;
}

export class AtualizarClienteDto {
  @ApiPropertyOptional({ example: 'João Silva Jr.' })
  @IsString()
  @IsNotEmpty()
  nome?: string;

  @ApiPropertyOptional({ example: 'novo@email.com' })
  @IsEmail()
  email?: string;
}
