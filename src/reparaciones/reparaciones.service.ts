import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Rol } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearReparacionDto } from './dto/crear-reparacion.dto';
import { ActualizarReparacionDto } from './dto/actualizar-reparacion.dto';
import type { UsuarioJwt } from '../common/interfaces/usuario-jwt.interface';

@Injectable()
export class ReparacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuario: UsuarioJwt, dto: CrearReparacionDto) {
    const ordenBase =
      usuario.rol === Rol.SUPER_ADMIN
        ? await this.prisma.orden.findUnique({
            where: { id: dto.ordenId },
            select: { id: true, empresaId: true },
          })
        : await this.prisma.orden.findFirst({
            where: { id: dto.ordenId, empresaId: usuario.empresaId },
            select: { id: true, empresaId: true },
          });
    if (!ordenBase) {
      throw new ForbiddenException(
        'La orden no pertenece a su empresa o no existe',
      );
    }
    const empresaId = ordenBase.empresaId;
    const tecnicoId =
      usuario.rol === Rol.TECNICO ? usuario.idUsuario : dto.tecnicoId;
    if (!tecnicoId) {
      throw new BadRequestException('Debe enviar tecnicoId para la reparación');
    }
    await this.validarTecnicoPerteneceAEmpresa(tecnicoId, empresaId);
    return this.prisma.$transaction(async (tx) => {
      const reparacion = await tx.reparacion.create({
        data: {
          descripcionTrabajo: dto.descripcionTrabajo,
          ordenId: dto.ordenId,
          empresaId,
          tecnicoId,
        },
      });

      if (dto.repuestos?.length) {
        await this.registrarRepuestosEnReparacion(
          tx,
          empresaId,
          reparacion.id,
          dto,
        );
      }

      return tx.reparacion.findUniqueOrThrow({
        where: { id: reparacion.id },
        include: {
          tecnico: { select: { id: true, nombre: true, correo: true } },
          orden: { include: { cliente: true } },
          reparacionesRepuesto: {
            include: {
              repuesto: { select: { id: true, nombre: true } },
            },
          },
        },
      });
    });
  }

  listar(usuario: UsuarioJwt) {
    const where: Prisma.ReparacionWhereInput = this.condicionEmpresa(usuario);
    if (usuario.rol === Rol.TECNICO) {
      where.tecnicoId = usuario.idUsuario;
    }
    return this.prisma.reparacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: {
        tecnico: { select: { id: true, nombre: true } },
        orden: { select: { id: true, codigo: true, estado: true } },
        reparacionesRepuesto: {
          include: { repuesto: { select: { id: true, nombre: true } } },
        },
      },
    });
  }

  async listarPorOrden(usuario: UsuarioJwt, ordenId: string) {
    if (usuario.rol !== Rol.SUPER_ADMIN) {
      await this.validarOrdenPerteneceAEmpresa(ordenId, usuario.empresaId);
    }
    const where: Prisma.ReparacionWhereInput = {
      ordenId,
      ...this.condicionEmpresa(usuario),
    };
    if (usuario.rol === Rol.TECNICO) {
      where.tecnicoId = usuario.idUsuario;
    }
    return this.prisma.reparacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: {
        tecnico: { select: { id: true, nombre: true } },
        reparacionesRepuesto: {
          include: { repuesto: { select: { id: true, nombre: true } } },
        },
      },
    });
  }

  async obtenerPorId(usuario: UsuarioJwt, id: string) {
    const where: Prisma.ReparacionWhereInput = {
      id,
      ...this.condicionEmpresa(usuario),
    };
    if (usuario.rol === Rol.TECNICO) {
      where.tecnicoId = usuario.idUsuario;
    }
    const reparacion = await this.prisma.reparacion.findFirst({
      where,
      include: {
        tecnico: { select: { id: true, nombre: true, correo: true } },
        orden: { include: { cliente: true } },
        reparacionesRepuesto: {
          include: { repuesto: { select: { id: true, nombre: true } } },
        },
      },
    });
    if (!reparacion) {
      throw new NotFoundException('Reparación no encontrada');
    }
    return reparacion;
  }

  async actualizar(
    usuario: UsuarioJwt,
    id: string,
    dto: ActualizarReparacionDto,
  ) {
    const reparacion = await this.obtenerPorId(usuario, id);
    const empresaId = reparacion.empresaId;
    if (dto.tecnicoId && usuario.rol !== Rol.TECNICO) {
      await this.validarTecnicoPerteneceAEmpresa(dto.tecnicoId, empresaId);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.reparacion.update({
        where: { id },
        data: {
          ...(dto.descripcionTrabajo !== undefined && {
            descripcionTrabajo: dto.descripcionTrabajo,
          }),
          ...(dto.tecnicoId !== undefined && { tecnicoId: dto.tecnicoId }),
        },
      });

      if (dto.repuestos) {
        await tx.reparacionRepuesto.deleteMany({
          where: { reparacionId: id, empresaId },
        });
        await this.registrarRepuestosEnReparacion(tx, empresaId, id, dto);
      }

      return tx.reparacion.findUniqueOrThrow({
        where: { id },
        include: {
          tecnico: { select: { id: true, nombre: true, correo: true } },
          orden: true,
          reparacionesRepuesto: {
            include: { repuesto: { select: { id: true, nombre: true } } },
          },
        },
      });
    });
  }

  async eliminar(usuario: UsuarioJwt, id: string) {
    if (usuario.rol === Rol.TECNICO) {
      throw new ForbiddenException(
        'No tiene permisos para eliminar reparaciones',
      );
    }
    await this.obtenerPorId(usuario, id);
    await this.prisma.reparacion.delete({ where: { id } });
    return { eliminado: true, id };
  }

  private async validarOrdenPerteneceAEmpresa(
    ordenId: string,
    empresaId: string,
  ) {
    const orden = await this.prisma.orden.findFirst({
      where: { id: ordenId, empresaId },
    });
    if (!orden) {
      throw new ForbiddenException(
        'La orden no pertenece a su empresa o no existe',
      );
    }
  }

  private async validarTecnicoPerteneceAEmpresa(
    tecnicoId: string,
    empresaId: string,
  ) {
    const tecnico = await this.prisma.usuario.findFirst({
      where: { id: tecnicoId, empresaId, activo: true },
      select: { id: true },
    });
    if (!tecnico) {
      throw new ForbiddenException(
        'El técnico no pertenece a su empresa o no existe',
      );
    }
  }

  private async registrarRepuestosEnReparacion(
    tx: Prisma.TransactionClient,
    empresaId: string,
    reparacionId: string,
    dto: Pick<CrearReparacionDto, 'repuestos'>,
  ) {
    if (!dto.repuestos?.length) {
      return;
    }

    for (const item of dto.repuestos) {
      const repuesto = await tx.repuesto.findFirst({
        where: { id: item.repuestoId, empresaId },
      });
      if (!repuesto) {
        throw new NotFoundException(
          `Repuesto ${item.repuestoId} no encontrado en la empresa`,
        );
      }
      if (repuesto.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para repuesto ${repuesto.nombre}`,
        );
      }

      await tx.repuesto.update({
        where: { id: repuesto.id },
        data: { stock: { decrement: item.cantidad } },
      });

      await tx.reparacionRepuesto.create({
        data: {
          reparacionId,
          repuestoId: repuesto.id,
          cantidad: item.cantidad,
          empresaId,
        },
      });
    }
  }

  private condicionEmpresa(usuario: UsuarioJwt): Prisma.ReparacionWhereInput {
    return usuario.rol === Rol.SUPER_ADMIN
      ? {}
      : { empresaId: usuario.empresaId };
  }
}
