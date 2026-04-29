import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReparacionesService } from './reparaciones.service';
import { CrearReparacionDto } from './dto/crear-reparacion.dto';
import { ActualizarReparacionDto } from './dto/actualizar-reparacion.dto';

@Controller('reparaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.TECNICO)
export class ReparacionesController {
  constructor(private readonly reparacionesService: ReparacionesService) {}

  @Post()
  crear(@UsuarioActual() usuario: UsuarioJwt, @Body() dto: CrearReparacionDto) {
    return this.reparacionesService.crear(usuario, dto);
  }

  @Get()
  listar(@UsuarioActual() usuario: UsuarioJwt) {
    return this.reparacionesService.listar(usuario);
  }

  @Get('orden/:ordenId')
  listarPorOrden(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('ordenId', ParseUUIDPipe) ordenId: string,
  ) {
    return this.reparacionesService.listarPorOrden(usuario, ordenId);
  }

  @Get(':id')
  obtener(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reparacionesService.obtenerPorId(usuario, id);
  }

  @Patch(':id')
  actualizar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarReparacionDto,
  ) {
    return this.reparacionesService.actualizar(usuario, id, dto);
  }

  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  eliminar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reparacionesService.eliminar(usuario, id);
  }
}
