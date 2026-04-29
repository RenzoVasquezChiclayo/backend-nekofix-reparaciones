import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  crear(empresaId: string, dto: CrearClienteDto) {
    return this.prisma.cliente.create({
      data: {
        nombre: dto.nombre,
        correo: dto.correo,
        telefono: dto.telefono,
        notas: dto.notas,
        empresaId,
      },
    });
  }

  listar(empresaId: string) {
    return this.prisma.cliente.findMany({
      where: { empresaId },
      orderBy: { nombre: 'asc' },
    });
  }

  async obtenerPorId(empresaId: string, id: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, empresaId },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async actualizar(empresaId: string, id: string, dto: ActualizarClienteDto) {
    await this.obtenerPorId(empresaId, id);
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

  async eliminar(empresaId: string, id: string) {
    await this.obtenerPorId(empresaId, id);
    await this.prisma.cliente.delete({ where: { id } });
    return { eliminado: true, id };
  }
}
