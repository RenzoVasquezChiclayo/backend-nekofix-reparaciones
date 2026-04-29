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
import { Rol } from '@prisma/client';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { Roles } from '../common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientesService } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Rol.SUPER_ADMIN, Rol.ADMIN, Rol.TECNICO)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  crear(@UsuarioActual() usuario: UsuarioJwt, @Body() dto: CrearClienteDto) {
    return this.clientesService.crear(usuario, dto);
  }

  @Get()
  listar(@UsuarioActual() usuario: UsuarioJwt) {
    return this.clientesService.listar(usuario);
  }

  @Get(':id')
  obtener(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientesService.obtenerPorId(usuario, id);
  }

  @Patch(':id')
  actualizar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarClienteDto,
  ) {
    return this.clientesService.actualizar(usuario, id, dto);
  }

  @Delete(':id')
  eliminar(
    @UsuarioActual() usuario: UsuarioJwt,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.clientesService.eliminar(usuario, id);
  }
}
