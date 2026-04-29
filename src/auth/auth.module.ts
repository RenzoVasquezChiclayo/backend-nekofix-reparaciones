import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtEstrategia } from './estrategias/jwt.estrategia';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const crudo = config.get<string | number>(
          'JWT_EXPIRA_SEGUNDOS',
          60 * 60 * 24 * 7,
        );
        const segundos =
          typeof crudo === 'string'
            ? parseInt(crudo, 10) || 60 * 60 * 24 * 7
            : crudo;
        return {
          secret: config.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn: segundos },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtEstrategia],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
