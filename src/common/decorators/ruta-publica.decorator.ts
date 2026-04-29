import { SetMetadata } from '@nestjs/common';
import { CLAVE_RUTA_PUBLICA } from '../constantes/clave-publica.metadata';

export const RutaPublica = () => SetMetadata(CLAVE_RUTA_PUBLICA, true);
