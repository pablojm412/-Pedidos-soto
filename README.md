# Pedidos Soto

App de pedidos para cadena de comida en Villa de Soto.

## Estado del proyecto
🔧 Etapa: estructura base del backend en desarrollo

## Equipo y roles

- **Frontend Móvil** — app para hacer pedidos (incluye diseño de pantallas)
- **Backend** — API, base de datos, lógica de pedidos
- **Administrador de Proyecto y QA** — coordinación, tablero de tareas, testing

## Estructura del repo (monorepo)

```
-Pedidos-soto/
├── api-contrato.yaml              <- OpenAPI, fuente de verdad de la API
├── diagrama-entidad-relacion.md   <- Diagrama ER de la base de datos
├── backend-checklist.md           <- Checklist de tareas del backend
├── README.md
│
├── backend/                       <- Proyecto NestJS (en desarrollo)
├── app-cliente/                   <- App/web del cliente (pendiente)
└── panel-operativo/               <- Panel comercio + repartidor + admin (pendiente)
```

Todo el código vive en este único repo, organizado por carpetas. Cada uno trabaja
en la suya sin pisarse, pero no hace falta agregar colaboradores repo por repo.

## Flujo de trabajo Git

- Rama `main`: siempre desplegable, nadie commitea directo ahí.
- Ramas de feature: `feature/nombre-corto` (ej: `feature/checkout-mercadopago`).
- Pull Request antes de mergear, aunque sea con revisión rápida entre el equipo.

## Regla de oro sobre el contrato de API

`api-contrato.yaml` es la fuente de verdad. Si alguien necesita un campo nuevo,
un endpoint nuevo, o cambiar un tipo de dato:

1. Lo propone en este repo (PR o aviso al grupo).
2. El resto lo revisa antes de implementarlo.
3. Recién ahí se codea en la carpeta que corresponda.

## Cómo visualizar el contrato

Pegar el contenido de `api-contrato.yaml` en https://editor.swagger.io para verlo
como documentación navegable.

## Próximos pasos

- [x] Estructura base del backend (NestJS + TypeORM + PostgreSQL, 5 módulos)
- [ ] Implementar autenticación con JWT (login/registro)
- [x] Confirmar PostgreSQL como base de datos con el equipo
- [ ] Definir estrategia de tiempo real (polling propuesto + push notifications para avisos)
- [x] Elegir hosting de backend y de base de datos
