export interface RespuestaEstandarExito<T = unknown> {
  success: true;
  mensaje: string;
  data: T;
  meta?: unknown;
}

export interface RespuestaEstandarError {
  success: false;
  mensaje: string;
  error: string;
}
