export interface Categoria { id: string; name: string; icon: string; }

export interface Producto { id: number; name: string; price: number; desc: string; }

export interface Comercio {
  id: number;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  isFreeDelivery: boolean;
  costoEnvio: number;
  image: string;
  products: Producto[];
}

export interface ItemCarrito { id: number; name: string; price: number; qty: number; }

export interface Usuario { id: number; name: string; email: string; rol: string; }

export interface Pedido {
  id: number;
  numero: string;
  estado: string;
  items: ItemCarrito[];
  total: number;
}


// ============ ADMIN ============
export interface EstadisticasGenerales {
  totalComercios: number;
  comerciosActivos: number;
  totalPedidos: number;
  pedidosEntregados: number;
  ventasTotales: number;
}

export interface PedidoAdmin {
  id: number;
  cliente_id: number;
  comercio_id: number;
  repartidor_id: number | null;
  estado: string;
  subtotal: number;
  costo_envio: number;
  total: number;
  direccion_entrega: string;
  creado_en: string;
}

export interface ReporteVentas {
  cantidadPedidos: number;
  totalVendido: number;
  pedidos: PedidoAdmin[];
}