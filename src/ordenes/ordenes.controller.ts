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
import { EmpresaActual } from '../common/decorators/empresa-actual.decorator';
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
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @RespuestaExito('Orden creada correctamente')
  crear(
    @EmpresaActual() empresaId: string,
    @UsuarioActual() usuario: UsuarioJwt,
    @Body() dto: CrearOrdenDto,
  ) {
    return this.ordenesService.crear(empresaId, usuario.idUsuario, dto);
  }

  @Get()
  @RespuestaExito('Órdenes obtenidas correctamente')
  listar(@EmpresaActual() empresaId: string) {
    return this.ordenesService.listar(empresaId);
  }

  @Get(':id')
  @RespuestaExito('Orden obtenida correctamente')
  obtener(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordenesService.obtenerPorId(empresaId, id);
  }

  @Patch(':id')
  @RespuestaExito('Orden actualizada correctamente')
  actualizar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarOrdenDto,
  ) {
    return this.ordenesService.actualizar(empresaId, id, dto);
  }

  @Patch(':id/estado')
  @RespuestaExito('Estado de la orden actualizado correctamente')
  cambiarEstado(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoOrdenDto,
  ) {
    return this.ordenesService.cambiarEstado(empresaId, id, dto.estado);
  }

  /** Solo ADMIN puede eliminar órdenes (JwtAuthGuard + RolesGuard; el servicio sigue filtrando por empresaId). */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN)
  @RespuestaExito('Orden eliminada correctamente')
  eliminar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordenesService.eliminar(empresaId, id);
  }
}
