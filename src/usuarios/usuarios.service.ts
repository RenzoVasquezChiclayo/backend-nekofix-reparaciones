import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(usuario: UsuarioJwt) {
    const where: Prisma.UsuarioWhereInput =
      usuario.rol === Rol.SUPER_ADMIN
        ? {}
        : {
            empresaId: usuario.empresaId,
            activo: true,
            rol: { not: Rol.SUPER_ADMIN },
          };

    return this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        correo: true,
        nombre: true,
        rol: true,
        activo: true,
        empresaId: true,
        creadoEn: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async crear(usuarioActual: UsuarioJwt, dto: CrearUsuarioDto) {
    if (usuarioActual.rol === Rol.TECNICO) {
      throw new ForbiddenException('No tiene permisos para crear usuarios');
    }
    const rolAsignado =
      usuarioActual.rol === Rol.SUPER_ADMIN
        ? (dto.rol ?? Rol.ADMIN)
        : Rol.TECNICO;
    if (
      usuarioActual.rol !== Rol.SUPER_ADMIN &&
      rolAsignado === Rol.SUPER_ADMIN
    ) {
      throw new ForbiddenException('No puede crear usuarios SUPER_ADMIN');
    }

    const contrasena = await bcrypt.hash(dto.contrasena, 12);
    try {
      return await this.prisma.usuario.create({
        data: {
          correo: dto.correo,
          nombre: dto.nombre,
          contrasena,
          rol: rolAsignado,
          activo: true,
          empresaId: usuarioActual.empresaId,
        },
        select: {
          id: true,
          correo: true,
          nombre: true,
          rol: true,
          empresaId: true,
          creadoEn: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
      throw error;
    }
  }

  async desactivar(usuarioActual: UsuarioJwt, id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (
      usuarioActual.rol !== Rol.SUPER_ADMIN &&
      usuario.empresaId !== usuarioActual.empresaId
    ) {
      throw new ForbiddenException(
        'No puede desactivar usuarios de otra empresa',
      );
    }
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });
  }
}
