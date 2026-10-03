import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ItemCarrito, Pedido } from '../models';
import { AuthService } from './auth.service';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly opcionesTip = [0, 200, 400, 600];

  readonly items = signal<ItemCarrito[]>([]);
  readonly comercioId = signal<number | null>(null);
  readonly costoEnvio = signal(0);
  readonly tip = signal(0);
  readonly abierto = signal(false);
  readonly ultimoPedido = signal<Pedido | null>(null);

  readonly cantidad = computed(() => this.items().reduce((a, i) => a + i.qty, 0));
  readonly subtotal = computed(() => this.items().reduce((a, i) => a + i.price * i.qty, 0));
  readonly total = computed(() =>
    this.items().length ? this.subtotal() + this.costoEnvio() + this.tip() : 0
  );

  /** Devuelve false si el producto es de otro comercio y el usuario no quiere vaciar el carrito. */
  agregar(comercioId: number, costoEnvio: number, id: number, name: string, price: number): boolean {
    const actual = this.comercioId();
    if (actual !== null && actual !== comercioId && this.items().length) {
      if (!confirm('Tu carrito tiene productos de otro local. ¿Vaciarlo y empezar de nuevo?')) return false;
      this.items.set([]);
    }
    this.comercioId.set(comercioId);
    this.costoEnvio.set(costoEnvio);
    this.items.update(list => {
      const existe = list.find(i => i.id === id);
      return existe
        ? list.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...list, { id, name, price, qty: 1 }];
    });
    this.abierto.set(true);
    return true;
  }

  cambiarCantidad(index: number, delta: number) {
    this.items.update(list =>
      list
        .map((item, i) => (i === index ? { ...item, qty: item.qty + delta } : item))
        .filter(item => item.qty > 0)
    );
  }

  vaciar() {
    this.items.set([]);
    this.comercioId.set(null);
    this.costoEnvio.set(0);
  }

  /** Devuelve null si salió bien, o el mensaje de error. */
  async confirmar(): Promise<string | null> {
    const usuario = this.auth.usuario();
    const comercioId = this.comercioId();
    if (!usuario || comercioId === null) return 'Iniciá sesión y agregá productos.';

    // El backend no tiene columna de propina: se manda subtotal + envío, para que los importes cierren.
    const totalGuardado = this.subtotal() + this.costoEnvio();
    const body = {
      cliente_id: usuario.id,
      comercio_id: comercioId,
      subtotal: this.subtotal(),
      costo_envio: this.costoEnvio(),
      total: totalGuardado,
      direccion_entrega: 'Av. Siempreviva 742', // TODO: tomar de la dirección elegida
      items: this.items().map(i => ({
        producto_id: i.id,
        cantidad: i.qty,
        precio_unitario: i.price,
      })),
    };

    try {
      const r: any = await firstValueFrom(this.http.post(`${API}/pedidos`, body));
      this.ultimoPedido.set({
        id: r.id,
        numero: 'RRS-' + r.id,
        estado: r.estado,
        items: this.items(),
        total: totalGuardado,
      });
      this.vaciar();
      this.abierto.set(false);
      return null;
    } catch (e: any) {
      if (e?.status === 0) return 'No se pudo conectar con el servidor.';
      const m = e?.error?.message;
      return Array.isArray(m) ? m.join(', ') : (m ?? 'No se pudo crear el pedido.');
    }
  }
}