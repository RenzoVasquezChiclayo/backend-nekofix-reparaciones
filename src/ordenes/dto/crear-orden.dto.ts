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

export class CrearOrdenDto {
  @IsString()
  @MinLength(1, { message: 'La descripción del problema es obligatoria' })
  descripcionProblema: string;

  @IsString()
  @MinLength(1, { message: 'El dispositivo es obligatorio' })
  @MaxLength(100, { message: 'El dispositivo no puede exceder 100 caracteres' })
  dispositivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'La marca no puede exceder 80 caracteres' })
  marca?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El modelo no puede exceder 120 caracteres' })
  modelo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, {
    message: 'El número de serie no puede exceder 120 caracteres',
  })
  numeroSerie?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe tener máximo 2 decimales' },
  )
  @Min(0, { message: 'El precio no puede ser negativo' })
  precio?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(PENDIENTE|PARCIAL|PAGADO)$/, {
    message: 'El estado de pago debe ser PENDIENTE, PARCIAL o PAGADO',
  })
  estadoPago?: string;

  @IsUUID('4', { message: 'El cliente debe ser un UUID válido' })
  clienteId: string;

  @IsOptional()
  @IsEnum(EstadoOrden, { message: 'Estado de orden no válido' })
  estado?: EstadoOrden;
}
