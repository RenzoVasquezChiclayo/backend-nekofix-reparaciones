import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CrearReparacionRepuestoDto {
  @IsUUID('4', { message: 'El repuestoId debe ser un UUID válido' })
  repuestoId: string;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  cantidad: number;
}

export class CrearReparacionDto {
  @IsString()
  @MinLength(1)
  descripcionTrabajo: string;

  @IsUUID('4')
  ordenId: string;

  @IsOptional()
  @IsUUID('4', { message: 'El tecnicoId debe ser un UUID válido' })
  tecnicoId: string;

  @IsOptional()
  @IsArray({ message: 'Los repuestos deben enviarse como arreglo' })
  @ArrayMinSize(1, { message: 'Si envía repuestos, debe incluir al menos uno' })
  @ValidateNested({ each: true })
  @Type(() => CrearReparacionRepuestoDto)
  repuestos?: CrearReparacionRepuestoDto[];
}
