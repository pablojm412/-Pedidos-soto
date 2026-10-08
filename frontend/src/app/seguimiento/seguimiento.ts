import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarritoService } from '../services/carrito.service';
import { PagosService } from '../services/pagos.service';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

@Component({
  selector: 'app-seguimiento',
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-3xl px-4 py-8">
      @if (cargando()) {
        <p class="py-16 text-center font-semibold text-slate-800">Cargando...</p>
      } @else if (error()) {
        <div class="py-16 text-center text-slate-700">
          <p>{{ error() }}</p>
          <a routerLink="/" class="mt-4 inline-block font-bold text-brand-orange hover:underline">Ver restaurantes</a>
        </div>
      } @else if (pedido(); as p) {
        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
          <div class="bg-brand-blue p-6 text-center text-white">
            <div class="mb-2 inline-block rounded-full bg-white/10 p-3"><i class="fa-solid fa-motorcycle text-3xl text-brand-orange"></i></div>
            <h2 class="text-2xl font-black">{{ titulo() }}</h2>
            <p class="mt-1 text-sm text-slate-200">Pedido <span class="font-bold text-brand-orange">#RRS-{{ p.id }}</span></p>
          </div>

          <div class="relative flex h-64 items-center justify-center overflow-hidden bg-slate-200">
            <svg class="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" stroke-width="1"/></pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="relative h-1 w-3/4 border-t-4 border-dashed border-brand-orange">
                <div class="absolute -top-3 left-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs text-white"><i class="fa-solid fa-store"></i></div>
                <div class="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 animate-bounce items-center justify-center rounded-full bg-brand-orange text-sm text-white shadow-lg"><i class="fa-solid fa-motorcycle"></i></div>
                <div class="absolute -top-3 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white"><i class="fa-solid fa-house"></i></div>
              </div>
            </div>
          </div>

          <div class="p-6">
            @if (estado() === 'cancelado') {
              <p class="mb-6 rounded-xl bg-rose-50 p-3 text-center text-sm font-semibold text-rose-600">Este pedido fue cancelado.</p>
            } @else {
              <div class="relative mx-auto mb-8 flex max-w-md items-center justify-between">
                <div class="absolute left-0 right-0 top-1/2 z-0 h-1 -translate-y-1/2 bg-slate-200"></div>
                <div class="absolute left-0 top-1/2 z-0 h-1 -translate-y-1/2 bg-brand-orange transition-all duration-500" [style.width.%]="actual() * 33.3"></div>
                @for (e of etapas; track e.label; let i = $index) {
                  <div class="relative z-10 flex flex-col items-center">
                    <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                      [class]="i <= actual() ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-400'"
                      [class.ring-4]="i === actual()" [class.ring-orange-100]="i === actual()">
                      <i class="fa-solid" [class]="e.icon"></i>
                    </div>
                    <span class="mt-1 text-[10px] font-bold" [class]="i === actual() ? 'text-brand-orange' : i < actual() ? 'text-slate-700' : 'text-slate-400'">{{ e.label }}</span>
                  </div>
                }
              </div>
            }

            <div class="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Detalles del Pedido #RRS-{{ p.id }}</h4>
              @if (p.direccion_entrega) {
                <p class="text-xs text-slate-500"><i class="fa-solid fa-location-dot mr-1 text-brand-orange"></i>{{ p.direccion_entrega }}</p>
              }
              @if (verificandoPago()) {
                <p class="text-xs font-bold text-blue-600"><i class="fa-solid fa-spinner fa-spin mr-1"></i>Verificando pago</p>
              } @else if (pagoEstado() === 'aprobado') {
                <p class="text-xs font-bold text-emerald-600"><i class="fa-solid fa-circle-check mr-1"></i>Pagado</p>
              } @else if (pagoEstado() === 'pendiente') {
                <p class="text-xs font-bold text-amber-600"><i class="fa-solid fa-clock mr-1"></i>Pago pendiente</p>
              } @else if (pagoEstado() === 'rechazado') {
                <p class="text-xs font-bold text-rose-600"><i class="fa-solid fa-circle-xmark mr-1"></i>Pago rechazado</p>
              }
              <div class="space-y-1 divide-y divide-slate-200/60 text-sm">
                @for (it of p.items; track it.id) {
                  <div class="flex justify-between pt-1">
                    <span>{{ it.cantidad }}x {{ it.producto?.nombre }}</span>
                    <span class="font-semibold">{{ '$' + monto(it.precio_unitario) * it.cantidad }}</span>
                  </div>
                }
                @if (monto(p.costo_envio) > 0) {
                  <div class="flex justify-between pt-1 text-slate-600"><span>Envío</span><span>{{ '$' + monto(p.costo_envio) }}</span></div>
                }
                <div class="flex justify-between pt-1 font-extrabold"><span>Total</span><span class="text-brand-orange">{{ '$' + monto(p.total) }}</span></div>
              </div>
            </div>

            <a routerLink="/mis-pedidos" class="mt-6 block w-full rounded-xl bg-brand-blue py-3 text-center text-sm font-bold text-white transition-all hover:bg-brand-darkblue">Ver mis pedidos</a>
          </div>
        </div>
      } @else {
        <div class="py-16 text-center text-slate-700">
          <p>Todavía no hiciste ningún pedido.</p>
          <a routerLink="/" class="mt-4 inline-block font-bold text-brand-orange hover:underline">Ver restaurantes</a>
        </div>
      }
    </main>
  `,
})
export class Seguimiento implements OnInit, OnDestroy {
  private carrito = inject(CarritoService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private pagosSvc = inject(PagosService);
  private timer?: ReturnType<typeof setInterval>;

  protected pedido = signal<any | null>(null);
  protected cargando = signal(false);
  protected error = signal('');
  protected pagoEstado = signal<string | null>(null);
  protected verificandoPago = signal(false);

  private readonly orden = ['pendiente', 'aceptado', 'en_camino', 'entregado'];
  protected estado = computed(() => this.pedido()?.estado ?? 'pendiente');
  protected actual = computed(() => Math.max(0, this.orden.indexOf(this.estado())));

  protected titulo = computed(() => {
    switch (this.estado()) {
      case 'aceptado': return '¡Tu pedido se está preparando!';
      case 'en_camino': return '¡Tu pedido está en camino!';
      case 'entregado': return '¡Pedido entregado!';
      case 'cancelado': return 'Pedido cancelado';
      default: return 'Pedido recibido, esperando confirmación';
    }
  });

  protected etapas = [
    { label: 'Confirmado', icon: 'fa-check' },
    { label: 'En cocina', icon: 'fa-fire' },
    { label: 'En camino', icon: 'fa-motorcycle' },
    { label: 'Entregado', icon: 'fa-box-open' },
  ];

  protected monto = (v: any) => Number(v);

  async ngOnInit() {
    // Sin id en la URL, se usa el último pedido hecho en esta sesión
    const idUrl = Number(this.route.snapshot.paramMap.get('id'));
    const id = idUrl || this.carrito.ultimoPedido()?.id;
    if (!id) return;

    this.cargando.set(true);
    await this.consultar(id, true);
    this.cargando.set(false);

    if (!this.error()) this.cargarPago(id);

    const estado = this.estado();
    if (!this.error() && estado !== 'entregado' && estado !== 'cancelado') {
      this.timer = setInterval(() => this.consultar(id, false), 8000);
    }
  }

  ngOnDestroy() { clearInterval(this.timer); }

  /** Lee el estado del pago y, si sigue pendiente, le pide al backend que lo revise en Mercado Pago. */
  private async cargarPago(id: number) {
    const estado = await this.pagosSvc.estadoDelPedido(id);
    this.pagoEstado.set(estado);

    if (estado === 'pendiente' && this.estado() !== 'cancelado') {
      this.verificandoPago.set(true);
      const nuevo = await this.pagosSvc.sincronizar(id);
      if (nuevo) this.pagoEstado.set(nuevo);
      this.verificandoPago.set(false);
    }
  }

  private consultar(id: number, primera: boolean): Promise<void> {
    return new Promise(resolve => {
      this.http.get<any>(`${API}/pedidos/${id}`).subscribe({
        next: r => {
          if (r?.id) {
            this.pedido.set(r);
            if (r.estado === 'entregado' || r.estado === 'cancelado') clearInterval(this.timer);
          }
          resolve();
        },
        error: (e) => {
          // Los errores del refresco automático se ignoran; el de la primera carga se muestra
          if (primera) {
            this.error.set(
              e?.status === 404 ? 'No encontramos ese pedido.'
              : e?.status === 403 ? 'Ese pedido no es tuyo.'
              : e?.status === 0 ? 'No se pudo conectar con el servidor.'
              : 'No se pudo cargar el pedido.');
          }
          resolve();
        },
      });
    });
  }
}