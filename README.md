# Pedidos Soto

App de pedidos para cadena de comida en Villa de Soto.

## Estado del proyecto
🔧 Etapa: definición del contrato de API (pre-desarrollo)

## Equipo y roles

- **Programador 1** — Frontend clientes (app móvil/web para hacer pedidos)
- **Programador 2** — Backend y base de datos (API, autenticación, lógica de pedidos)
- **Programador 3** — Frontend operativo (panel del comercio, app de repartidores, panel admin)

## Estructura de repos

```
-Pedidos-soto/              <- este repo (documentación + contrato de API)
├── api-contract.yaml       <- OpenAPI, fuente de verdad de la API
└── README.md

pedidos-backend/             <- Programador 2
pedidos-app-cliente/         <- Programador 1
pedidos-panel-operativo/     <- Programador 3
```

## Flujo de trabajo Git

- Rama `main`: siempre desplegable, nadie commitea directo ahí.
- Ramas de feature: `feature/nombre-corto` (ej: `feature/checkout-mercadopago`).
- Pull Request antes de mergear, aunque sea con revisión rápida entre los tres.

## Regla de oro sobre el contrato de API

`api-contract.yaml` es la fuente de verdad. Si alguien necesita un campo nuevo,
un endpoint nuevo, o cambiar un tipo de dato:

1. Lo propone en este repo (PR o aviso al grupo).
2. Los otros dos lo revisan antes de implementarlo.
3. Recién ahí se codea en el repo que corresponda.

## Cómo visualizar el contrato

Pegar el contenido de `api-contract.yaml` en https://editor.swagger.io para verlo
como documentación navegable.

## Próximos pasos

- [ ] Revisar `api-contract.yaml` entre los 3 y ajustar lo que falte
- [ ] Definir estrategia de tiempo real para pedidos (WebSockets vs push vs polling)
- [ ] Armar diagrama entidad-relación de la base de datos
- [ ] Elegir hosting de backend y de bases de datos
- [ ] Sumar a los otros dos como colaboradores del repo
