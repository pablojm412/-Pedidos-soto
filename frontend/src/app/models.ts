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

   export interface ItemCarrito { productoId: number; name: string; price: number; qty: number; }

export interface Usuario { id: number; name: string; email: string; rol: string; }

export interface Pedido { numero: string; items: ItemCarrito[]; total: number; }