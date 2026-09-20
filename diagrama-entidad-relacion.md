# Diagrama entidad-relación - Pedidos Soto

Este diagrama se renderiza automáticamente al verlo en GitHub (no hace falta ninguna herramienta externa).

```mermaid
erDiagram
  USUARIO ||--o{ PEDIDO : realiza
  USUARIO ||--o{ COMERCIO : administra
  USUARIO ||--o{ PEDIDO : reparte
  COMERCIO ||--o{ PRODUCTO : ofrece
  COMERCIO ||--o{ PEDIDO : recibe
  PEDIDO ||--|{ ITEM_PEDIDO : contiene
  PRODUCTO ||--o{ ITEM_PEDIDO : incluido_en
  PEDIDO ||--o| PAGO : genera

  USUARIO {
    uuid id PK
    string email
    string nombre
    string telefono
    string rol
    string password_hash
  }
  COMERCIO {
    uuid id PK
    uuid usuario_id FK
    string nombre
    string categoria
    string direccion
    float lat
    float lng
    boolean abierto
    float costo_envio_base
  }
  PRODUCTO {
    uuid id PK
    uuid comercio_id FK
    string nombre
    string descripcion
    float precio
    boolean disponible
    int stock
  }
  PEDIDO {
    uuid id PK
    uuid cliente_id FK
    uuid comercio_id FK
    uuid repartidor_id FK
    string estado
    float subtotal
    float costo_envio
    float total
    string direccion_entrega
    datetime creado_en
  }
  ITEM_PEDIDO {
    uuid id PK
    uuid pedido_id FK
    uuid producto_id FK
    int cantidad
    float precio_unitario
  }
  PAGO {
    uuid id PK
    uuid pedido_id FK
    string proveedor
    string estado
    float monto
    string referencia_externa
  }
```

## Notas de diseño

- **`rol` en `USUARIO`**: distingue cliente / comercio / repartidor / admin en una sola tabla,
  en vez de tener tablas separadas por tipo de usuario. Más simple para el login y la autenticación.
- **`precio_unitario` en `ITEM_PEDIDO`**: se guarda el precio al momento de la compra, no se
  referencia el precio actual del producto. Si el comercio cambia precios después, no debe
  afectar pedidos ya hechos.
- **`repartidor_id` en `PEDIDO`**: puede ser nulo — el pedido nace sin repartidor asignado y
  se completa cuando alguien lo toma.
- **`PAGO` como tabla separada**: permite trackear el estado del pago (pendiente, aprobado,
  rechazado por Mercado Pago) de forma independiente al estado logístico del pedido
  (en preparación, en camino, entregado).
- **Relación `USUARIO administra COMERCIO`**: asume que cada comercio tiene un único usuario
  dueño/administrador. Si más adelante necesitan que varios usuarios administren el mismo
  comercio, esto pasaría a ser una tabla intermedia (`COMERCIO_ADMINS`).

## Pendiente de discutir con el equipo

- ¿El campo `estado` de `PEDIDO` se guarda como string o conviene una tabla `ESTADOS_PEDIDO`
  aparte con historial de cambios (para poder saber cuánto tardó cada etapa)?
- ¿Necesitan una tabla de `CALIFICACIONES` (cliente califica pedido/repartidor)? No está en este
  primer borrador porque no se mencionó como prioridad.
- ¿`COMERCIO` necesita horarios de atención estructurados (tabla aparte por día) en vez de un
  campo de texto libre?
