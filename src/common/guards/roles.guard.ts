import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { CLAVE_ROLES_REQUERIDOS } from '../decorators/roles.decorator';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(
      CLAVE_ROLES_REQUERIDOS,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (!rolesRequeridos?.length) {
      return true;
    }
    const solicitud = contexto
      .switchToHttp()
      .getRequest<{ user: UsuarioJwt }>();
    const usuario = solicitud.user;
    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }
    if (usuario.rol === Rol.SUPER_ADMIN) {
      return true;
    }
    const permitido = rolesRequeridos.includes(usuario.rol);
    if (!permitido) {
      throw new ForbiddenException('No tiene permisos para esta operación');
    }
    return true;
  }
}
