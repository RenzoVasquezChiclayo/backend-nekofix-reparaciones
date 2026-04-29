import { Rol } from '@prisma/client';

export interface CargaUtilJwt {
  sub: string;
  empresaId: string;
  rol: Rol;
  correo: string;
}

export interface UsuarioJwt {
  idUsuario: string;
  empresaId: string;
  rol: Rol;
  correo: string;
}
