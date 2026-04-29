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

export class ActualizarReparacionRepuestoDto {
  @IsUUID('4')
  repuestoId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class ActualizarReparacionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  descripcionTrabajo?: string;

  @IsOptional()
  @IsUUID('4')
  tecnicoId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ActualizarReparacionRepuestoDto)
  repuestos?: ActualizarReparacionRepuestoDto[];
}
