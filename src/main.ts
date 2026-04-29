import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { FiltroExcepcionEstandarFilter } from './common/filters/filtro-excepcion-estandar.filter';
import { RespuestaEstandarInterceptor } from './common/interceptors/respuesta-estandar.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000'], // frontend
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new RespuestaEstandarInterceptor(reflector));
  app.useGlobalFilters(new FiltroExcepcionEstandarFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
