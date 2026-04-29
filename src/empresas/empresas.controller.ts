import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Rol } from '@prisma/client';
import { EmpresasService } from './empresas.service';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ListarEmpresasDto } from './dto/listar-empresas.dto';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';

@Controller('empresas')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN)
  listar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Query() query: ListarEmpresasDto,
  ) {
    return this.empresasService.listar(usuario, query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN)
  crear(@UsuarioActual() usuario: UsuarioJwt, @Body() dto: CrearEmpresaDto) {
    return this.empresasService.crear(usuario, dto);
  }

  @Get(':id')
  obtener(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) empresaId: string,
  ) {
    return this.empresasService.obtenerPorId(usuario, empresaId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN)
  actualizar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) empresaId: string,
    @Body() dto: ActualizarEmpresaDto,
  ) {
    return this.empresasService.actualizar(usuario, empresaId, dto);
  }

  @Patch(':id/desactivar')
  @UseGuards(RolesGuard)
  @Roles(Rol.SUPER_ADMIN)
  desactivar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) empresaId: string,
  ) {
    return this.empresasService.desactivar(usuario, empresaId);
  }
}
