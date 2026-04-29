import { Rol } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(8)
  contrasena: string;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}
