import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ActualizarClienteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}
