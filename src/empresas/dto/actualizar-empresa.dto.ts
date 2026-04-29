import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarEmpresaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
