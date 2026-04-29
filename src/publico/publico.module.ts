import { Module } from '@nestjs/common';
import { OrdenesModule } from '../ordenes/ordenes.module';
import { PublicoController } from './publico.controller';

@Module({
  imports: [OrdenesModule],
  controllers: [PublicoController],
})
export class PublicoModule {}
