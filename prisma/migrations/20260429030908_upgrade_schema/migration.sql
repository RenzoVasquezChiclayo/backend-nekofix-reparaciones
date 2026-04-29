-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'TECNICO');

-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'TERMINADO');

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "razon_social" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "empresa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT,
    "telefono" TEXT,
    "notas" TEXT,
    "empresa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" "EstadoOrden" NOT NULL DEFAULT 'PENDIENTE',
    "descripcion_problema" TEXT NOT NULL,
    "dispositivo" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "numero_serie" TEXT,
    "precio" DECIMAL(10,2),
    "estado_pago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "token_consulta" TEXT,
    "cliente_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones" (
    "id" TEXT NOT NULL,
    "descripcion_trabajo" TEXT NOT NULL,
    "orden_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tecnico_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reparaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL,
    "estado" "EstadoOrden" NOT NULL,
    "orden_id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repuestos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "empresa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones_repuestos" (
    "id" TEXT NOT NULL,
    "reparacion_id" TEXT NOT NULL,
    "repuesto_id" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reparaciones_repuestos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "usuarios_empresa_id_idx" ON "usuarios"("empresa_id");

-- CreateIndex
CREATE INDEX "clientes_empresa_id_idx" ON "clientes"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_token_consulta_key" ON "ordenes"("token_consulta");

-- CreateIndex
CREATE INDEX "ordenes_empresa_id_idx" ON "ordenes"("empresa_id");

-- CreateIndex
CREATE INDEX "ordenes_cliente_id_idx" ON "ordenes"("cliente_id");

-- CreateIndex
CREATE INDEX "ordenes_creado_por_id_idx" ON "ordenes"("creado_por_id");

-- CreateIndex
CREATE INDEX "ordenes_token_consulta_idx" ON "ordenes"("token_consulta");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_empresa_id_codigo_key" ON "ordenes"("empresa_id", "codigo");

-- CreateIndex
CREATE INDEX "reparaciones_empresa_id_idx" ON "reparaciones"("empresa_id");

-- CreateIndex
CREATE INDEX "reparaciones_orden_id_idx" ON "reparaciones"("orden_id");

-- CreateIndex
CREATE INDEX "reparaciones_tecnico_id_idx" ON "reparaciones"("tecnico_id");

-- CreateIndex
CREATE INDEX "historial_estados_empresa_id_idx" ON "historial_estados"("empresa_id");

-- CreateIndex
CREATE INDEX "historial_estados_orden_id_idx" ON "historial_estados"("orden_id");

-- CreateIndex
CREATE INDEX "historial_estados_orden_id_creado_en_idx" ON "historial_estados"("orden_id", "creado_en");

-- CreateIndex
CREATE INDEX "repuestos_empresa_id_idx" ON "repuestos"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "repuestos_empresa_id_nombre_key" ON "repuestos"("empresa_id", "nombre");

-- CreateIndex
CREATE INDEX "reparaciones_repuestos_empresa_id_idx" ON "reparaciones_repuestos"("empresa_id");

-- CreateIndex
CREATE INDEX "reparaciones_repuestos_reparacion_id_idx" ON "reparaciones_repuestos"("reparacion_id");

-- CreateIndex
CREATE INDEX "reparaciones_repuestos_repuesto_id_idx" ON "reparaciones_repuestos"("repuesto_id");

-- CreateIndex
CREATE UNIQUE INDEX "reparaciones_repuestos_reparacion_id_repuesto_id_key" ON "reparaciones_repuestos"("reparacion_id", "repuesto_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes" ADD CONSTRAINT "ordenes_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_tecnico_id_fkey" FOREIGN KEY ("tecnico_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repuestos" ADD CONSTRAINT "repuestos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones_repuestos" ADD CONSTRAINT "reparaciones_repuestos_reparacion_id_fkey" FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones_repuestos" ADD CONSTRAINT "reparaciones_repuestos_repuesto_id_fkey" FOREIGN KEY ("repuesto_id") REFERENCES "repuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones_repuestos" ADD CONSTRAINT "reparaciones_repuestos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
