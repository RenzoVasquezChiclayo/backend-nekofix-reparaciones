import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioJwt } from '../interfaces/usuario-jwt.interface';

export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioJwt => {
    const solicitud = contexto
      .switchToHttp()
      .getRequest<{ user: UsuarioJwt }>();
    return solicitud.user;
  },
);
