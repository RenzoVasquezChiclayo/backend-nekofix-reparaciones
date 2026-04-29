import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearRepuestoDto } from './dto/crear-repuesto.dto';

@Injectable()
export class RepuestosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(empresaId: string, dto: CrearRepuestoDto) {
    try {
      return await this.prisma.repuesto.create({
        data: {
          nombre: dto.nombre,
          stock: dto.stock,
          empresaId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe un repuesto con ese nombre en su empresa',
        );
      }
      throw error;
    }
  }

  listar(empresaId: string) {
    return this.prisma.repuesto.findMany({
      where: { empresaId },
      orderBy: { nombre: 'asc' },
    });
  }
}
