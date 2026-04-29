import { Controller, Get } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresaActual } from '../common/decorators/empresa-actual.decorator';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get('mi-empresa')
  obtenerMiEmpresa(@EmpresaActual() empresaId: string) {
    return this.empresasService.obtenerPorIdParaUsuario(empresaId);
  }
}
