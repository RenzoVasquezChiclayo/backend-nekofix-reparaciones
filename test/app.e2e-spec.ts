import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { FiltroExcepcionEstandarFilter } from './../src/common/filters/filtro-excepcion-estandar.filter';
import { RespuestaEstandarInterceptor } from './../src/common/interceptors/respuesta-estandar.interceptor';
import { PrismaService } from './../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ?? 'clave-de-prueba-jwt-suficientemente-larga-32';
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://usuario:clave@127.0.0.1:5432/solo_para_compilar';

    const prismaMock = {
      onModuleInit: async () => {},
      onModuleDestroy: async () => {},
      $connect: async () => {},
      $disconnect: async () => {},
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    const reflector = app.get(Reflector);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new RespuestaEstandarInterceptor(reflector));
    app.useGlobalFilters(new FiltroExcepcionEstandarFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) estado público', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          success: true,
          mensaje: 'Servicio disponible',
          data: {
            servicio: 'nekofix-reparaciones-api',
            estado: 'en_linea',
          },
        });
      });
  });
});
