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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { RespuestaExito } from '../common/decorators/respuesta-exito.decorator';
import { OrdenesService } from './ordenes.service';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarOrdenDto } from './dto/actualizar-orden.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';

/**
 * CRUD de órdenes aislado por empresa_id vía JWT (@EmpresaActual).
 * JwtAuthGuard asegura usuario autenticado; el servicio filtra siempre por empresaId.
 */
@Controller('ordenes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.TECNICO)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @RespuestaExito('Orden creada correctamente')
  crear(@UsuarioActual() usuario: UsuarioJwt, @Body() dto: CrearOrdenDto) {
    return this.ordenesService.crear(usuario, dto);
  }

  @Get()
  @RespuestaExito('Órdenes obtenidas correctamente')
  listar(@UsuarioActual() usuario: UsuarioJwt) {
    return this.ordenesService.listar(usuario);
  }

  @Get(':id')
  @RespuestaExito('Orden obtenida correctamente')
  obtener(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordenesService.obtenerPorId(usuario, id);
  }

  @Patch(':id')
  @RespuestaExito('Orden actualizada correctamente')
  actualizar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarOrdenDto,
  ) {
    return this.ordenesService.actualizar(usuario, id, dto);
  }

  @Patch(':id/estado')
  @RespuestaExito('Estado de la orden actualizado correctamente')
  cambiarEstado(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoOrdenDto,
  ) {
    return this.ordenesService.cambiarEstado(usuario, id, dto.estado);
  }

  /** Solo ADMIN puede eliminar órdenes (JwtAuthGuard + RolesGuard; el servicio sigue filtrando por empresaId). */
  @Delete(':id')
  @Roles(Rol.SUPER_ADMIN, Rol.ADMIN)
  @RespuestaExito('Orden eliminada correctamente')
  eliminar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordenesService.eliminar(usuario, id);
  }
}
