# Tiempo real: decisión y guía de implementación

## Decisión

Usamos **polling** (consultas periódicas al backend), no WebSockets ni push
notifications, al menos para esta primera versión del proyecto.

**Por qué:** el equipo ya tiene bastante complejidad encima (dos repos de
backend que hubo que reconciliar, todavía sin hosting elegido). Polling no
agrega infraestructura nueva: usa los mismos endpoints REST que ya existen.
Se puede migrar a WebSockets más adelante sin tocar el backend actual — es
una capa que se agrega encima, no algo que haya que rehacer.

## Cómo funciona

El panel del comercio le pregunta al backend cada 8-10 segundos si hay
pedidos nuevos, usando el endpoint que ya existe:

Si la respuesta trae pedidos que no estaban en la última consulta, se
muestran como "nuevos" (por ejemplo con un sonido o un resaltado).

## Ejemplo de código (vanilla JS, para el panel del comercio)

```javascript
const API_URL = "http://localhost:3000"; // cambiar cuando haya hosting
const INTERVALO_MS = 8000; // 8 segundos

let idsConocidos = new Set();

async function revisarPedidosNuevos() {
  try {
    const token = localStorage.getItem("comercioToken");
    const res = await fetch(`${API_URL}/pedidos?estado=pendiente_pago`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Error consultando pedidos:", res.status);
      return;
    }

    const pedidos = await res.json();
    const idsActuales = new Set(pedidos.map((p) => p.id));

    const nuevos = pedidos.filter((p) => !idsConocidos.has(p.id));
    if (nuevos.length > 0 && idsConocidos.size > 0) {
      mostrarNotificacionPedidoNuevo(nuevos);
    }

    idsConocidos = idsActuales;
    renderizarListaPedidos(pedidos);
  } catch (err) {
    console.error("Error de red consultando pedidos:", err);
  }
}

function mostrarNotificacionPedidoNuevo(pedidos) {
  console.log(`${pedidos.length} pedido(s) nuevo(s)`);
}

function renderizarListaPedidos(pedidos) {
  // TODO: actualizar el DOM con la lista de pedidos
}

revisarPedidosNuevos();
setInterval(revisarPedidosNuevos, INTERVALO_MS);
```

## Notas para quien implemente el panel del comercio

- El intervalo de 8 segundos es un punto de partida; se puede ajustar según
  cuántos comercios usen el panel a la vez.
- Cuando haya hosting, cambiar `API_URL` por la URL real.
- Si en el futuro migran a WebSockets, este mismo endpoint REST sigue
  funcionando como respaldo.

## Pendiente de decidir

- ¿El cliente también necesita ver el estado de su pedido actualizándose
  solo? Si es así, aplica la misma lógica de polling sobre `GET /pedidos/:id`.
