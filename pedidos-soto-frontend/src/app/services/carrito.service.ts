import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Comercio, ItemCarrito, Pedido, Producto } from '../models';
import { AuthService } from './auth.service';

const API = 'http://localhost:3000';
const DIRECCION = 'Av. Siempreviva 742'; // TODO: hoy es la fija del encabezado

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly opcionesTip = [0, 200, 400, 600];

  readonly items = signal<ItemCarrito[]>([]);
  readonly comercioId = signal<number | null>(null);
  readonly costoEnvio = signal(0);
  readonly tip = signal(200);
  readonly abierto = signal(false);
  readonly enviando = signal(false);
  readonly ultimoPedido = signal<Pedido | null>(null);

  get deliveryFee() { return this.costoEnvio(); }

  readonly cantidad = computed(() => this.items().reduce((a, i) => a + i.qty, 0));
  readonly subtotal = computed(() => this.items().reduce((a, i) => a + i.price * i.qty, 0));
  readonly total = computed(() =>
    this.items().length ? this.subtotal() + this.costoEnvio() + this.tip() : 0
  );

  agregar(p: Producto, c: Comercio) {
    if (this.items().length && this.comercioId() !== c.id) {
      if (!confirm('Tu carrito tiene productos de otro local. ¿Vaciarlo y empezar con este?')) return;
      this.items.set([]);
    }
    this.comercioId.set(c.id);
    this.costoEnvio.set(c.costoEnvio);
    this.items.update(list => {
      const existe = list.find(i => i.productoId === p.id);
      return existe
        ? list.map(i => (i.productoId === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...list, { productoId: p.id, name: p.name, price: p.price, qty: 1 }];
    });
    this.abierto.set(true);
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
  }

  /** Devuelve null si salió bien, o el mensaje de error. */
  async confirmar(): Promise<string | null> {
    const u = this.auth.usuario();
    const comercioId = this.comercioId();
    if (!u || comercioId === null) return 'Iniciá sesión para hacer el pedido.';

    const subtotal = this.subtotal();
    const costoEnvio = this.costoEnvio();
    const body = {
      cliente_id: u.id,
      comercio_id: comercioId,
      direccion_entrega: DIRECCION,
      subtotal,
      costo_envio: costoEnvio,
      total: subtotal + costoEnvio, // la propina todavía no tiene columna en la base
      items: this.items().map(i => ({
        producto_id: i.productoId,
        cantidad: i.qty,
        precio_unitario: i.price,
      })),
    };

    this.enviando.set(true);
    try {
      const r: any = await firstValueFrom(
        this.http.post(`${API}/pedidos`, body, {
          headers: { Authorization: `Bearer ${this.auth.token}` },
        }),
      );
      this.ultimoPedido.set({ numero: 'RRS-' + r.id, items: this.items(), total: Number(r.total) });
      this.vaciar();
      this.abierto.set(false);
      return null;
    } catch (e: any) {
      if (e?.status === 0) return 'No se pudo conectar con el servidor.';
      const m = e?.error?.message;
      return Array.isArray(m) ? m.join(', ') : (m ?? 'No se pudo crear el pedido.');
    } finally {
      this.enviando.set(false);
    }
  }
}