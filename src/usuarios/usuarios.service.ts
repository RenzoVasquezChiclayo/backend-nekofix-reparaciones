import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorEmpresa(empresaId: string) {
    return this.prisma.usuario.findMany({
      where: { empresaId, activo: true },
      select: {
        id: true,
        correo: true,
        nombre: true,
        rol: true,
        creadoEn: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }
}
