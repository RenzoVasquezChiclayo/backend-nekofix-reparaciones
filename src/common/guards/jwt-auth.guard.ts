import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CLAVE_RUTA_PUBLICA } from '../constantes/clave-publica.metadata';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(contexto: ExecutionContext) {
    const esPublica = this.reflector.getAllAndOverride<boolean>(
      CLAVE_RUTA_PUBLICA,
      [contexto.getHandler(), contexto.getClass()],
    );
    if (esPublica) {
      return true;
    }
    return super.canActivate(contexto);
  }
}
