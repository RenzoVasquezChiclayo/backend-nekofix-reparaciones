import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma, EstadoOrden } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarOrdenDto } from './dto/actualizar-orden.dto';

@Injectable()
export class OrdenesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(empresaId: string, creadoPorId: string, dto: CrearOrdenDto) {
    await this.validarClientePerteneceAEmpresa(dto.clienteId, empresaId);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const codigo = await this.generarCodigoOrden(tx, empresaId);
        const tokenConsulta = this.generarTokenConsulta();
        const orden = await tx.orden.create({
          data: {
            codigo,
            descripcionProblema: dto.descripcionProblema,
            dispositivo: dto.dispositivo,
            marca: dto.marca,
            modelo: dto.modelo,
            numeroSerie: dto.numeroSerie,
            precio: dto.precio,
            estadoPago: dto.estadoPago ?? 'PENDIENTE',
            clienteId: dto.clienteId,
            empresaId,
            creadoPorId,
            tokenConsulta,
            estado: dto.estado ?? EstadoOrden.PENDIENTE,
          },
          include: { cliente: true },
        });

        await this.registrarHistorialEstado(tx, {
          estado: orden.estado,
          ordenId: orden.id,
          empresaId,
        });

        return orden;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe una orden con ese código en su empresa',
        );
      }
      throw error;
    }
  }

  async listar(empresaId: string) {
    return this.prisma.orden.findMany({
      where: { empresaId },
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: true,
        _count: { select: { reparaciones: true, historialEstados: true } },
      },
    });
  }

  async obtenerPorId(empresaId: string, id: string) {
    const orden = await this.prisma.orden.findFirst({
      where: { id, empresaId },
      include: {
        cliente: true,
        historialEstados: { orderBy: { creadoEn: 'desc' } },
        reparaciones: {
          include: {
            tecnico: { select: { id: true, nombre: true, correo: true } },
            reparacionesRepuesto: {
              include: {
                repuesto: { select: { id: true, nombre: true } },
              },
            },
          },
        },
      },
    });
    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }
    return orden;
  }

  async consultarPorToken(tokenConsulta: string) {
    const orden = await this.prisma.orden.findFirst({
      where: { tokenConsulta },
      include: {
        cliente: {
          select: {
            nombre: true,
            telefono: true,
            correo: true,
          },
        },
        reparaciones: {
          include: {
            tecnico: { select: { id: true, nombre: true } },
            reparacionesRepuesto: {
              include: {
                repuesto: { select: { id: true, nombre: true } },
              },
            },
          },
          orderBy: { creadoEn: 'desc' },
        },
        historialEstados: {
          orderBy: { creadoEn: 'desc' },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException('Orden no encontrada para el token enviado');
    }

    return orden;
  }

  async actualizar(empresaId: string, id: string, dto: ActualizarOrdenDto) {
    const ordenActual = await this.obtenerPorId(empresaId, id);
    if (dto.clienteId) {
      await this.validarClientePerteneceAEmpresa(dto.clienteId, empresaId);
    }
    try {
      return await this.prisma.$transaction(async (tx) => {
        const orden = await tx.orden.update({
          where: { id },
          data: {
            ...(dto.codigo !== undefined && { codigo: dto.codigo }),
            ...(dto.estado !== undefined && { estado: dto.estado }),
            ...(dto.dispositivo !== undefined && {
              dispositivo: dto.dispositivo,
            }),
            ...(dto.marca !== undefined && { marca: dto.marca }),
            ...(dto.modelo !== undefined && { modelo: dto.modelo }),
            ...(dto.numeroSerie !== undefined && {
              numeroSerie: dto.numeroSerie,
            }),
            ...(dto.precio !== undefined && { precio: dto.precio }),
            ...(dto.estadoPago !== undefined && { estadoPago: dto.estadoPago }),
            ...(dto.descripcionProblema !== undefined && {
              descripcionProblema: dto.descripcionProblema,
            }),
            ...(dto.clienteId !== undefined && { clienteId: dto.clienteId }),
          },
          include: { cliente: true },
        });

        const cambioEstado =
          dto.estado !== undefined && dto.estado !== ordenActual.estado;
        if (cambioEstado) {
          await this.registrarHistorialEstado(tx, {
            estado: dto.estado!,
            ordenId: orden.id,
            empresaId,
          });
        }

        return orden;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'Ya existe una orden con ese código en su empresa',
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Orden no encontrada');
        }
      }
      throw error;
    }
  }

  async cambiarEstado(empresaId: string, id: string, estado: EstadoOrden) {
    const ordenActual = await this.obtenerPorId(empresaId, id);
    if (ordenActual.estado === estado) {
      return ordenActual;
    }
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.orden.update({
        where: { id },
        data: { estado },
        include: { cliente: true },
      });

      await this.registrarHistorialEstado(tx, {
        estado,
        ordenId: id,
        empresaId,
      });

      return orden;
    });
  }

  async eliminar(empresaId: string, id: string) {
    const orden = await this.prisma.orden.findFirst({
      where: { id, empresaId },
    });
    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }
    await this.prisma.orden.delete({ where: { id } });
    return { eliminado: true, id };
  }

  private async validarClientePerteneceAEmpresa(
    clienteId: string,
    empresaId: string,
  ) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, empresaId },
    });
    if (!cliente) {
      throw new ForbiddenException(
        'El cliente no pertenece a su empresa o no existe',
      );
    }
  }

  private async registrarHistorialEstado(
    tx: Prisma.TransactionClient,
    datos: { estado: EstadoOrden; ordenId: string; empresaId: string },
  ) {
    await tx.historialEstado.create({ data: datos });
  }

  private async generarCodigoOrden(
    tx: Prisma.TransactionClient,
    empresaId: string,
  ) {
    const hoy = new Date();
    const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}${String(hoy.getDate()).padStart(2, '0')}`;
    const total = await tx.orden.count({ where: { empresaId } });
    return `ORD-${fecha}-${String(total + 1).padStart(5, '0')}`;
  }

  private generarTokenConsulta() {
    return randomBytes(16).toString('hex');
  }
}
