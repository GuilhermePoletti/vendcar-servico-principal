import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, Max, IsPositive, IsOptional } from 'class-validator';

export class CriarVeiculoDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', description: 'UUID da marca' })
  @IsUUID('4', { message: 'idMarca deve ser um UUID válido' })
  idMarca: string;

  @ApiProperty({ example: 'Civic', description: 'Modelo do veículo' })
  @IsString()
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  modelo: string;

  @ApiProperty({ example: 2024, description: 'Ano do veículo' })
  @IsNumber()
  @Min(1900)
  @Max(2100)
  ano: number;

  @ApiProperty({ example: 'Prata', description: 'Cor do veículo' })
  @IsString()
  @IsNotEmpty({ message: 'Cor é obrigatória' })
  cor: string;

  @ApiProperty({ example: 135000, description: 'Preço do veículo em reais' })
  @IsNumber()
  @IsPositive({ message: 'Preço deve ser maior que zero' })
  preco: number;
}

export class AtualizarVeiculoDto {
  @ApiPropertyOptional({ example: 'Civic Type R' })
  @IsOptional()
  @IsString()
  modelo?: string;

  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2100)
  ano?: number;

  @ApiPropertyOptional({ example: 'Vermelho' })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  preco?: number;
}
