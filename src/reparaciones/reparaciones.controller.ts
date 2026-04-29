import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { EmpresaActual } from '../common/decorators/empresa-actual.decorator';
import { ReparacionesService } from './reparaciones.service';
import { CrearReparacionDto } from './dto/crear-reparacion.dto';
import { ActualizarReparacionDto } from './dto/actualizar-reparacion.dto';

@Controller('reparaciones')
export class ReparacionesController {
  constructor(private readonly reparacionesService: ReparacionesService) {}

  @Post()
  crear(@EmpresaActual() empresaId: string, @Body() dto: CrearReparacionDto) {
    return this.reparacionesService.crear(empresaId, dto);
  }

  @Get()
  listar(@EmpresaActual() empresaId: string) {
    return this.reparacionesService.listar(empresaId);
  }

  @Get('orden/:ordenId')
  listarPorOrden(
    @EmpresaActual() empresaId: string,
    @Param('ordenId', ParseUUIDPipe) ordenId: string,
  ) {
    return this.reparacionesService.listarPorOrden(empresaId, ordenId);
  }

  @Get(':id')
  obtener(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reparacionesService.obtenerPorId(empresaId, id);
  }

  @Patch(':id')
  actualizar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarReparacionDto,
  ) {
    return this.reparacionesService.actualizar(empresaId, id, dto);
  }

  @Delete(':id')
  eliminar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.reparacionesService.eliminar(empresaId, id);
  }
}
