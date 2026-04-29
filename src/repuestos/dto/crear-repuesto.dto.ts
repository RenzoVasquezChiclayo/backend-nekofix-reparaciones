import { Type } from 'class-transformer';
import { IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CrearRepuestoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nombre: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock: number;
}
