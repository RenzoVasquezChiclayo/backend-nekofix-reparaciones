import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuariosService } from './usuarios.service';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar(@UsuarioActual() usuario: UsuarioJwt) {
    return this.usuariosService.listar(usuario);
  }

  @Post()
  crear(@UsuarioActual() usuario: UsuarioJwt, @Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(usuario, dto);
  }

  @Patch(':id/desactivar')
  desactivar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usuariosService.desactivar(usuario, id);
  }
}
