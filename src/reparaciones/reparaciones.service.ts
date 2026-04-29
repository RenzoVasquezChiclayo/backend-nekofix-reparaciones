import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearReparacionDto } from './dto/crear-reparacion.dto';
import { ActualizarReparacionDto } from './dto/actualizar-reparacion.dto';

@Injectable()
export class ReparacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(empresaId: string, dto: CrearReparacionDto) {
    await this.validarOrdenPerteneceAEmpresa(dto.ordenId, empresaId);
    await this.validarTecnicoPerteneceAEmpresa(dto.tecnicoId, empresaId);
    return this.prisma.$transaction(async (tx) => {
      const reparacion = await tx.reparacion.create({
        data: {
          descripcionTrabajo: dto.descripcionTrabajo,
          ordenId: dto.ordenId,
          empresaId,
          tecnicoId: dto.tecnicoId,
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

  listar(empresaId: string) {
    return this.prisma.reparacion.findMany({
      where: { empresaId },
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

  async listarPorOrden(empresaId: string, ordenId: string) {
    await this.validarOrdenPerteneceAEmpresa(ordenId, empresaId);
    return this.prisma.reparacion.findMany({
      where: { empresaId, ordenId },
      orderBy: { creadoEn: 'desc' },
      include: {
        tecnico: { select: { id: true, nombre: true } },
        reparacionesRepuesto: {
          include: { repuesto: { select: { id: true, nombre: true } } },
        },
      },
    });
  }

  async obtenerPorId(empresaId: string, id: string) {
    const reparacion = await this.prisma.reparacion.findFirst({
      where: { id, empresaId },
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
    empresaId: string,
    id: string,
    dto: ActualizarReparacionDto,
  ) {
    await this.obtenerPorId(empresaId, id);
    if (dto.tecnicoId) {
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

  async eliminar(empresaId: string, id: string) {
    await this.obtenerPorId(empresaId, id);
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
}
