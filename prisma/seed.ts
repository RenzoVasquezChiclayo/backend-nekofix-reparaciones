import { PrismaClient, Rol } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function principal() {
  const rondas = 12;
  const contrasena = await bcrypt.hash('Admin123!', rondas);

  const empresa = await prisma.empresa.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nombre: 'Nekofix Demo',
      razonSocial: 'Nekofix Demo S.A.',
      activa: true,
    },
  });

  await prisma.usuario.upsert({
    where: { correo: 'admin@nekofix.demo' },
    update: { contrasena },
    create: {
      correo: 'admin@nekofix.demo',
      contrasena,
      nombre: 'Administrador',
      rol: Rol.ADMIN,
      empresaId: empresa.id,
      activo: true,
    },
  });

  await prisma.usuario.upsert({
    where: { correo: 'tecnico@nekofix.demo' },
    update: { contrasena },
    create: {
      correo: 'tecnico@nekofix.demo',
      contrasena,
      nombre: 'Técnico',
      rol: Rol.TECNICO,
      empresaId: empresa.id,
      activo: true,
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      nombre: 'Cliente Demo',
      correo: 'cliente@ejemplo.com',
      telefono: '+51 999 000 000',
      empresaId: empresa.id,
    },
  });

  const admin = await prisma.usuario.findUniqueOrThrow({
    where: { correo: 'admin@nekofix.demo' },
    select: { id: true },
  });

  await prisma.orden.upsert({
    where: {
      empresaId_codigo: { empresaId: empresa.id, codigo: 'ORD-DEMO-001' },
    },
    update: {},
    create: {
      codigo: 'ORD-DEMO-001',
      descripcionProblema: 'Pantalla rota iPhone 14',
      dispositivo: 'iPhone 14',
      marca: 'Apple',
      modelo: 'A2882',
      estadoPago: 'PENDIENTE',
      tokenConsulta: 'token-demo-orden-001',
      clienteId: cliente.id,
      empresaId: empresa.id,
      creadoPorId: admin.id,
    },
  });

  process.stdout.write(
    'Seed completado. Usuarios: admin@nekofix.demo / tecnico@nekofix.demo — contraseña: Admin123!\n',
  );
}

principal()
  .catch((e) => {
    process.stderr.write(String(e) + '\n');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
