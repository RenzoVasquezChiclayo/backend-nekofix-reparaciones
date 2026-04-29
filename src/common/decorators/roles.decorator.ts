import { SetMetadata } from '@nestjs/common';
import { Rol } from '@prisma/client';

export const CLAVE_ROLES_REQUERIDOS = 'rolesRequeridos';

export const Roles = (...roles: Rol[]) =>
  SetMetadata(CLAVE_ROLES_REQUERIDOS, roles);
