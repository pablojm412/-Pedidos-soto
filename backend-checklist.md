# Backend - Checklist de arranque

Responsable: [tu nombre]
Stack: NestJS + TypeORM + PostgreSQL

## 1. Setup del proyecto

- [ ] Instalar Nest CLI: `npm install -g @nestjs/cli`
- [ ] Crear proyecto: `nest new pedidos-backend`
- [ ] Instalar dependencias: `npm install @nestjs/typeorm typeorm pg @nestjs/config`
- [ ] Crear archivo `.env` con las variables de conexión a Postgres (ver `.env.example` del repo de documentación)
- [ ] Configurar `app.module.ts` con `ConfigModule` y `TypeOrmModule.forRootAsync` (ya armado, está en el repo)
- [ ] Verificar que `npm run start:dev` levanta sin errores de conexión

## 2. Módulos a generar (uno por entidad del diagrama ER)

- [ ] `nest g module usuarios` + entity + controller + service
- [ ] `nest g module comercios` + entity + controller + service
- [ ] `nest g module productos` + entity + controller + service
- [ ] `nest g module pedidos` + entity + controller + service
- [ ] `nest g module pagos` + entity + controller + service

## 3. Entidades (según diagrama-entidad-relacion.md del repo)

- [ ] `Usuario`: id, email, nombre, telefono, rol, password_hash
- [ ] `Comercio`: id, usuario_id (FK), nombre, categoria, direccion, lat, lng, abierto, costo_envio_base
- [ ] `Producto`: id, comercio_id (FK), nombre, descripcion, precio, disponible, stock
- [ ] `Pedido`: id, cliente_id (FK), comercio_id (FK), repartidor_id (FK nullable), estado, subtotal, costo_envio, total, direccion_entrega, creado_en
- [ ] `ItemPedido`: id, pedido_id (FK), producto_id (FK), cantidad, precio_unitario
- [ ] `Pago`: id, pedido_id (FK), proveedor, estado, monto, referencia_externa

## 4. Endpoints a implementar (según api-contrato.yaml del repo)

Orden sugerido, de más simple/bloqueante a más complejo:

- [ ] `POST /auth/registro`
- [ ] `POST /auth/login` (con JWT)
- [ ] `POST /auth/refresh`
- [ ] `GET /comercios` (listar, con filtros)
- [ ] `GET /comercios/:id`
- [ ] `POST /comercios` (crear)
- [ ] `PATCH /comercios/:id`
- [ ] `GET /comercios/:id/productos`
- [ ] `POST /comercios/:id/productos`
- [ ] `PATCH /productos/:id`
- [ ] `DELETE /productos/:id`
- [ ] `POST /pedidos` (crear pedido)
- [ ] `GET /pedidos` (listar según rol)
- [ ] `GET /pedidos/:id`
- [ ] `PATCH /pedidos/:id/estado`
- [ ] `PATCH /pedidos/:id/asignar-repartidor`
- [ ] `PATCH /repartidores/:id/ubicacion`
- [ ] `POST /pagos/crear-preferencia` (Mercado Pago)
- [ ] `POST /pagos/webhook-mercadopago`

## 5. Pendiente de decidir con el equipo

- [ ] Estrategia de tiempo real (polling elegido para el estado del pedido, push notifications con FCM para avisar nuevo pedido al comercio)
- [ ] Confirmar PostgreSQL con el resto del equipo (propuesto, sin confirmar todavía)
- [ ] Hosting de backend y base de datos en producción

## Notas

- `synchronize: true` en TypeORM está bien para desarrollo (crea las tablas solas),
  pero hay que apagarlo antes de producción y pasar a migraciones.
- El `precio_unitario` en `ItemPedido` se guarda al momento de la compra, no se
  referencia el precio actual del producto.
