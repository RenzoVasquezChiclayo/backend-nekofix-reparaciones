import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RutaPublica } from './common/decorators/ruta-publica.decorator';
import { RespuestaExito } from './common/decorators/respuesta-exito.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @RutaPublica()
  @RespuestaExito('Servicio disponible')
  estado() {
    return this.appService.obtenerEstado();
  }
}
