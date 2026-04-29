import { EstadoOrden } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CambiarEstadoOrdenDto {
  @IsEnum(EstadoOrden, { message: 'Estado de orden no válido' })
  estado: EstadoOrden;
}
