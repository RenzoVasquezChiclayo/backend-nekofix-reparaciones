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
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import { ActualizarEmpresaDto } from './dto/actualizar-empresa.dto';
import { ListarEmpresasDto } from './dto/listar-empresas.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(usuario: UsuarioJwt, dto: ListarEmpresasDto) {
    this.validarSuperAdmin(usuario);
    const pagina = dto.pagina ?? 1;
    const limite = dto.limite ?? 20;
    const omitir = (pagina - 1) * limite;

    const where: Prisma.EmpresaWhereInput = dto.buscar
      ? {
          OR: [
            { nombre: { contains: dto.buscar, mode: 'insensitive' } },
            { razonSocial: { contains: dto.buscar, mode: 'insensitive' } },
          ],
        }
      : {};

    const [empresas, total] = await this.prisma.$transaction([
      this.prisma.empresa.findMany({
        where,
        skip: omitir,
        take: limite,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.empresa.count({ where }),
    ]);

    return {
      items: empresas,
      meta: { pagina, limite, total },
    };
  }

  async crear(usuario: UsuarioJwt, dto: CrearEmpresaDto) {
    this.validarSuperAdmin(usuario);
    const contrasenaPlano =
      dto.contrasenaAdmin ?? `Admin.${Math.random().toString(36).slice(2, 10)}`;
    const contrasenaHash = await bcrypt.hash(contrasenaPlano, 12);

    try {
      const creado = await this.prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.create({
          data: {
            nombre: dto.nombre,
            razonSocial: dto.razonSocial,
            activa: true,
          },
        });

        const admin = await tx.usuario.create({
          data: {
            correo: dto.correoAdmin,
            nombre: dto.nombreAdmin,
            contrasena: contrasenaHash,
            rol: Rol.ADMIN,
            activo: true,
            empresaId: empresa.id,
          },
        });
        return { empresa, admin };
      });

      return {
        ...creado,
        credencialesIniciales: {
          correo: dto.correoAdmin,
          contrasenaTemporal: dto.contrasenaAdmin ? undefined : contrasenaPlano,
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'No se puede crear la empresa: correo admin ya existe',
        );
      }
      throw error;
    }
  }

  async obtenerPorId(usuario: UsuarioJwt, empresaId: string) {
    const filtroEmpresaId =
      usuario.rol === Rol.SUPER_ADMIN ? empresaId : usuario.empresaId;
    const empresa = await this.prisma.empresa.findFirst({
      where: { id: filtroEmpresaId },
      include: {
        _count: {
          select: {
            usuarios: true,
            clientes: true,
            ordenes: true,
            reparaciones: true,
          },
        },
      },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return empresa;
  }

  async actualizar(
    usuario: UsuarioJwt,
    empresaId: string,
    dto: ActualizarEmpresaDto,
  ) {
    this.validarSuperAdmin(usuario);
    await this.validarExiste(empresaId);
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre }),
        ...(dto.razonSocial !== undefined && { razonSocial: dto.razonSocial }),
        ...(dto.activa !== undefined && { activa: dto.activa }),
      },
    });
  }

  async desactivar(usuario: UsuarioJwt, empresaId: string) {
    this.validarSuperAdmin(usuario);
    await this.validarExiste(empresaId);
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data: { activa: false },
    });
  }

  private validarSuperAdmin(usuario: UsuarioJwt) {
    if (usuario.rol !== Rol.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Solo SUPER_ADMIN puede realizar esta acción',
      );
    }
  }

  private async validarExiste(empresaId: string) {
    const existe = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });
    if (!existe) {
      throw new NotFoundException('Empresa no encontrada');
    }
  }
}
