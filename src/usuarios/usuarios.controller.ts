import { Controller, Get, UseGuards } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { EmpresaActual } from '../common/decorators/empresa-actual.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.ADMIN)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar(@EmpresaActual() empresaId: string) {
    return this.usuariosService.listarPorEmpresa(empresaId);
  }
}
