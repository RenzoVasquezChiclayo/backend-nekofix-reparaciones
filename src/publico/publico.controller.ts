import { Controller, Get, Param } from '@nestjs/common';
import { RutaPublica } from '../common/decorators/ruta-publica.decorator';
import { OrdenesService } from '../ordenes/ordenes.service';

@Controller('public')
export class PublicoController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Get('orden/:token')
  @RutaPublica()
  consultarOrdenPorToken(@Param('token') token: string) {
    return this.ordenesService.consultarPorToken(token);
  }
}
