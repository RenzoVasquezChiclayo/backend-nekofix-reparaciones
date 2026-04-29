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
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  crear(@EmpresaActual() empresaId: string, @Body() dto: CrearClienteDto) {
    return this.clientesService.crear(empresaId, dto);
  }

  @Get()
  listar(@EmpresaActual() empresaId: string) {
    return this.clientesService.listar(empresaId);
  }

  @Get(':id')
  obtener(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientesService.obtenerPorId(empresaId, id);
  }

  @Patch(':id')
  actualizar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarClienteDto,
  ) {
    return this.clientesService.actualizar(empresaId, id, dto);
  }

  @Delete(':id')
  eliminar(
    @EmpresaActual() empresaId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientesService.eliminar(empresaId, id);
  }
}
