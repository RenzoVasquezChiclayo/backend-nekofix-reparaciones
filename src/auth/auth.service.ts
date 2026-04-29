import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Rol } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { InicioSesionDto } from './dto/inicio-sesion.dto';
import { CargaUtilJwt } from '../common/interfaces/usuario-jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async iniciarSesion(dto: InicioSesionDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
      include: { empresa: true },
    });
    if (!usuario?.activo) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const coincide = await bcrypt.compare(dto.contrasena, usuario.contrasena);
    if (!coincide) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    if (usuario.rol !== Rol.SUPER_ADMIN && !usuario.empresa.activa) {
      throw new UnauthorizedException('La empresa está desactivada');
    }
    const carga: CargaUtilJwt = {
      sub: usuario.id,
      empresaId: usuario.empresaId,
      rol: usuario.rol,
      correo: usuario.correo,
    };
    const tokenAcceso = await this.jwtService.signAsync(carga);
    return {
      tokenAcceso,
      tipoToken: 'Bearer',
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol,
        empresaId: usuario.empresaId,
      },
    };
  }

  async obtenerPerfil(idUsuario: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id: idUsuario },
      include: { empresa: true },
    });
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      rol: usuario.rol,
      empresaId: usuario.empresaId,
      empresa: {
        id: usuario.empresa.id,
        nombre: usuario.empresa.nombre,
        activa: usuario.empresa.activa,
      },
    };
  }
}
