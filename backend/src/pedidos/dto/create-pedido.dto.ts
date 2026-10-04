export class CreatePedidoItemDto {
  producto_id: number;
  cantidad: number;
  // precio_unitario ya no se lee: el servidor usa el precio real del producto
}

export class CreatePedidoDto {
  comercio_id: number;
  direccion_entrega: string;
  items: CreatePedidoItemDto[];
  // Solo se usan como respaldo/referencia; subtotal y total los calcula el servidor
  costo_envio?: number;
  total?: number;
}
