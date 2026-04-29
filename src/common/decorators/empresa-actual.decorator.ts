import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';

/**
 * Devuelve el empresa_id del JWT (aislamiento multi-tenant).
 * Usar en controladores protegidos con JwtAuthGuard.
 */
export const EmpresaActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): string => {
    const solicitud = contexto
      .switchToHttp()
      .getRequest<{ user: UsuarioJwt }>();
    return solicitud.user.empresaId;
  },
);
