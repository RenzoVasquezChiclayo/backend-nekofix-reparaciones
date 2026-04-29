import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { RutaPublica } from '../common/decorators/ruta-publica.decorator';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('iniciar-sesion')
  @RutaPublica()
  iniciarSesion(@Body() dto: InicioSesionDto) {
    return this.authService.iniciarSesion(dto);
  }

  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioJwt) {
    return this.authService.obtenerPerfil(usuario.idUsuario);
  }
}
