import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerPorIdParaUsuario(empresaId: string) {
    const empresa = await this.prisma.empresa.findFirst({
      where: { id: empresaId, activa: true },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return empresa;
  }
}
