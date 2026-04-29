import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CrearEmpresaDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsEmail()
  correoAdmin: string;

  @IsString()
  @MinLength(2)
  nombreAdmin: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  contrasenaAdmin?: string;
}
