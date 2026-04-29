import { IsEmail, IsString, MinLength } from 'class-validator';

export class InicioSesionDto {
  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;
}
