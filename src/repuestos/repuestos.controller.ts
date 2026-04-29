import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmpresaActual } from '../common/decorators/empresa-actual.decorator';
import { CrearRepuestoDto } from './dto/crear-repuesto.dto';
import { RepuestosService } from './repuestos.service';

@Controller('repuestos')
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  @Post()
  crear(@EmpresaActual() empresaId: string, @Body() dto: CrearRepuestoDto) {
    return this.repuestosService.crear(empresaId, dto);
  }

  @Get()
  listar(@EmpresaActual() empresaId: string) {
    return this.repuestosService.listar(empresaId);
  }
}
