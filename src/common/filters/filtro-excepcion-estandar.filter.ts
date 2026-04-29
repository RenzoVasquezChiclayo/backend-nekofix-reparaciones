import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import type { RespuestaEstandarError } from '../interfaces/respuesta-estandar.interface';

@Catch()
export class FiltroExcepcionEstandarFilter implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionEstandarFilter.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<Response>();

    let estado = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje: string = 'Error interno del servidor';
    let codigoError = 'INTERNAL_SERVER_ERROR';

    if (excepcion instanceof HttpException) {
      estado = excepcion.getStatus();
      codigoError = this.codigoErrorDesdeEstado(estado, excepcion);
      const cuerpo = excepcion.getResponse();
      if (typeof cuerpo === 'string') {
        mensaje = cuerpo;
      } else if (
        typeof cuerpo === 'object' &&
        cuerpo !== null &&
        'message' in cuerpo
      ) {
        const m = (cuerpo as { message?: string | string[] }).message;
        mensaje = this.normalizarMensaje(m);
        const errorNombre = (cuerpo as { error?: string }).error;
        if (typeof errorNombre === 'string' && errorNombre.length > 0) {
          codigoError = this.normalizarCodigoError(errorNombre);
        }
      }
    } else if (excepcion instanceof Error) {
      this.logger.error(excepcion.stack ?? excepcion.message);
      mensaje = excepcion.message;
    } else {
      this.logger.error('Excepción desconocida', excepcion);
    }

    const cuerpo: RespuestaEstandarError = {
      success: false,
      mensaje,
      error: codigoError,
    };

    respuesta.status(estado).json(cuerpo);
  }

  private normalizarMensaje(valor: string | string[] | undefined): string {
    if (valor === undefined) {
      return 'Error';
    }
    if (Array.isArray(valor)) {
      return valor.join('; ');
    }
    return valor;
  }

  private codigoErrorDesdeEstado(
    estado: number,
    excepcion: HttpException,
  ): string {
    const cuerpo = excepcion.getResponse();
    if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo) {
      const e = (cuerpo as { error?: string }).error;
      if (typeof e === 'string' && e.length > 0) {
        return this.normalizarCodigoError(e);
      }
    }
    const mapa: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };
    return mapa[estado] ?? `HTTP_${estado}`;
  }

  private normalizarCodigoError(texto: string): string {
    return texto
      .replace(/\s+/g, '_')
      .replace(/[^A-Za-z0-9_]/g, '')
      .toUpperCase();
  }
}
