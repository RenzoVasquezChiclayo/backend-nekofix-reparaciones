import { applyDecorators, SetMetadata } from '@nestjs/common';
import {
  CLAVE_META_RESPUESTA_EXITO,
  CLAVE_MENSAJE_RESPUESTA_EXITO,
} from '../constantes/respuesta-estandar.metadata';

/**
 * Personaliza el mensaje (y opcionalmente meta) de la respuesta envuelta por el interceptor global.
 */
export const RespuestaExito = (mensaje: string, meta?: unknown) => {
  const decoradores = [SetMetadata(CLAVE_MENSAJE_RESPUESTA_EXITO, mensaje)];
  if (meta !== undefined) {
    decoradores.push(SetMetadata(CLAVE_META_RESPUESTA_EXITO, meta));
  }
  return applyDecorators(...decoradores);
};
