import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  crear(usuario: UsuarioJwt, dto: CrearClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        telefono: dto.telefono,
        notas: dto.notas,
        empresaId: usuario.empresaId,
      },
    });
  }

  listar(usuario: UsuarioJwt) {
    return this.prisma.cliente.findMany({
      where: this.condicionEmpresa(usuario),
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerPorId(usuario: UsuarioJwt, id: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, ...this.condicionEmpresa(usuario) },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async actualizar(usuario: UsuarioJwt, id: string, dto: ActualizarClienteDto) {
    await this.obtenerPorId(usuario, id);
    return this.prisma.cliente.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.correo !== undefined && { correo: dto.correo }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono }),
        ...(dto.notas !== undefined && { notas: dto.notas }),
      },
    });
  }

  async eliminar(usuario: UsuarioJwt, id: string) {
    await this.obtenerPorId(usuario, id);
    await this.prisma.cliente.delete({ where: { id } });
    return { eliminado: true, id };
  }

  private condicionEmpresa(usuario: UsuarioJwt): Prisma.ClienteWhereInput {
    return usuario.rol === Rol.SUPER_ADMIN
      ? {}
      : { empresaId: usuario.empresaId };
  }
}
