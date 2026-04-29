import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { Readable } from 'node:stream';
import {
  CLAVE_META_RESPUESTA_EXITO,
  CLAVE_MENSAJE_RESPUESTA_EXITO,
} from '../constantes/respuesta-estandar.metadata';
import type { RespuestaEstandarExito } from '../interfaces/respuesta-estandar.interface';

const MENSAJE_DEFECTO = 'Operación realizada correctamente';

@Injectable()
export class RespuestaEstandarInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Observable<unknown> {
    return siguiente.handle().pipe(
      map((datos: unknown): unknown => {
        if (this.debeOmitirEnvoltura(datos)) {
          return datos;
        }
        const manejador = contexto.getHandler();
        const clase = contexto.getClass();
        const mensaje =
          this.reflector.getAllAndOverride<string>(
            CLAVE_MENSAJE_RESPUESTA_EXITO,
            [manejador, clase],
          ) ?? MENSAJE_DEFECTO;
        const meta = this.reflector.getAllAndOverride<unknown>(
          CLAVE_META_RESPUESTA_EXITO,
          [manejador, clase],
        );

        const cuerpo: RespuestaEstandarExito = {
          success: true,
          mensaje,
          data: datos,
        };
        if (meta !== undefined) {
          cuerpo.meta = meta;
        }
        return cuerpo;
      }),
    );
  }

  private debeOmitirEnvoltura(datos: unknown): boolean {
    if (datos === null || datos === undefined) {
      return false;
    }
    if (
      typeof datos === 'object' &&
      datos !== null &&
      'success' in datos &&
      (datos as { success?: unknown }).success === true &&
      'mensaje' in datos &&
      'data' in datos
    ) {
      return true;
    }
    if (Buffer.isBuffer(datos)) {
      return true;
    }
    if (datos instanceof Uint8Array) {
      return true;
    }
    if (datos instanceof Readable) {
      return true;
    }
    return false;
  }
}
