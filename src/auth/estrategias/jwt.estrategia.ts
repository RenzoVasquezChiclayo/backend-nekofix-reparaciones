import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  CargaUtilJwt,
  UsuarioJwt,
} from '../../common/interfaces/usuario-jwt.interface';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy, 'jwt') {
  constructor(configuracion: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuracion.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(carga: CargaUtilJwt): UsuarioJwt {
    return {
      idUsuario: carga.sub,
      empresaId: carga.empresaId,
      rol: carga.rol,
      correo: carga.correo,
    };
  }
}
