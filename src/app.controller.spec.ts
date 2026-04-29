import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('estado', () => {
    it('debe devolver el estado del servicio', () => {
      expect(appController.estado()).toEqual({
        servicio: 'nekofix-reparaciones-api',
        estado: 'en_linea',
      });
    });
  });
});
