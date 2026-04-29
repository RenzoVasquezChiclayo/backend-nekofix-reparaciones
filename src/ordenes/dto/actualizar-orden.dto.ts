import { EstadoOrden } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class ActualizarOrdenDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  dispositivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  numeroSerie?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(PENDIENTE|PARCIAL|PAGADO)$/)
  estadoPago?: string;

  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;

  @IsOptional()
  @IsString()
  @MinLength(1)
  descripcionProblema?: string;

  @IsOptional()
  @IsUUID('4')
  clienteId?: string;
}
