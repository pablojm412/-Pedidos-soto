# Backend - Checklist de arranque

Responsable: [Pablo Maldonado]
Stack: NestJS + TypeORM + PostgreSQL

## 1. Setup del proyecto

- [x] Instalar Nest CLI: `npm install -g @nestjs/cli`
- [x] Crear proyecto: `nest new pedidos-backend`
- [x] Instalar dependencias: `npm install @nestjs/typeorm typeorm pg @nestjs/config`
- [x] Crear archivo `.env` con las variables de conexión a Postgres (ver `.env.example` del repo de documentación)
- [x] Configurar `app.module.ts` con `ConfigModule` y `TypeOrmModule.forRootAsync` (ya armado, está en el repo)
- [x] Verificar que `npm run start:dev` levanta sin errores de conexión

## 2. Módulos a generar (uno por entidad del diagrama ER)

- [x] `nest g module usuarios` + entity + controller + service
- [x] `nest g module comercios` + entity + controller + service
- [x] `nest g module productos` + entity + controller + service
- [x] `nest g module pedidos` + entity + controller + service
- [x] `nest g module pagos` + entity + controller + service

## 3. Entidades (según diagrama-entidad-relacion.md del repo)

- [x] `Usuario`: id, email, nombre, telefono, rol, password_hash
- [x] `Comercio`: id, usuario_id (FK), nombre, categoria, direccion, lat, lng, abierto, costo_envio_base
- [x] `Producto`: id, comercio_id (FK), nombre, descripcion, precio, disponible, stock
- [x] `Pedido`: id, cliente_id (FK), comercio_id (FK), repartidor_id (FK nullable), estado, subtotal, costo_envio, total, direccion_entrega, creado_en
- [x] `ItemPedido`: id, pedido_id (FK), producto_id (FK), cantidad, precio_unitario
- [x] `Pago`: id, pedido_id (FK), proveedor, estado, monto, referencia_externa

## 4. Endpoints a implementar (según api-contrato.yaml del repo)

Orden sugerido, de más simple/bloqueante a más complejo:

- [x] `POST /auth/registro`
- [x] `POST /auth/login` (con JWT)
- [x] `POST /auth/refresh`
- [x] `GET /comercios` (listar, con filtros)
- [x] `GET /comercios/:id`
- [x] `POST /comercios` (crear)
- [x] `PATCH /comercios/:id`
- [x] `GET /comercios/:id/productos`
- [x] `POST /comercios/:id/productos`
- [x] `PATCH /productos/:id`
- [x] `DELETE /productos/:id`
- [x] `POST /pedidos` (crear pedido)
- [x] `GET /pedidos` (listar según rol)
- [x] `GET /pedidos/:id`
- [x] `PATCH /pedidos/:id/estado`
- [x] `PATCH /pedidos/:id/asignar-repartidor`
- [x] `PATCH /repartidores/:id/ubicacion`
- [x] `POST /pagos/crear-preferencia` (Mercado Pago)
- [x] `POST /pagos/webhook-mercadopago`

## 5. Pendiente de decidir con el equipo

- [ ] Estrategia de tiempo real (polling elegido para el estado del pedido, push notifications con FCM para avisar nuevo pedido al comercio)
- [ ] Confirmar PostgreSQL con el resto del equipo (propuesto, sin confirmar todavía)
- [ ] Hosting de backend y base de datos en producción

## Notas

- `synchronize: true` en TypeORM está bien para desarrollo (crea las tablas solas),
  pero hay que apagarlo antes de producción y pasar a migraciones.
- El `precio_unitario` en `ItemPedido` se guarda al momento de la compra, no se
  referencia el precio actual del producto.
