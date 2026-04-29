import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  obtenerEstado() {
    return {
      servicio: 'nekofix-reparaciones-api',
      estado: 'en_linea',
    };
  }
}
