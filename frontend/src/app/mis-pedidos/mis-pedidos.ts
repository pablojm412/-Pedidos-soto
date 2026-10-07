import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { PagosService } from '../services/pagos.service';

const API = environment.apiUrl;

const ESTADOS: Record<string, string> = {
  pendiente: 'Pendiente',
  aceptado: 'En cocina',
  en_camino: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-mis-pedidos',
  imports: [DatePipe, RouterLink],
  template: `
    <main class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="mb-6 text-2xl font-black text-brand-blue">Mis pedidos</h1>

      @if (mensaje()) {
        <p class="py-16 text-center font-semibold text-slate-800">{{ mensaje() }}</p>
      } @else if (!cargado()) {
        <p class="py-16 text-center font-semibold text-slate-800">Cargando...</p>
      } @else {
        <div class="space-y-4">
          @for (p of ordenados(); track p.id) {
            <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <a [routerLink]="['/seguimiento', p.id]" class="font-extrabold text-slate-800 hover:text-brand-orange">Pedido #RRS-{{ p.id }}</a>
                  <p class="text-xs text-slate-500">{{ p.creado_en | date:'dd/MM HH:mm' }} · {{ p.comercio?.nombre }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-extrabold text-brand-orange">{{ '$' + monto(p.total) }}</p>
                  <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange">{{ etiqueta(p.estado) }}</span>
                  @if (pagos()[p.id] === 'aprobado') {
  <span class="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">Pagado</span>
} @else if (pagos()[p.id] === 'pendiente') {
  <span class="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">Pago pendiente</span>
} @else if (pagos()[p.id] === 'rechazado') {
  <span class="ml-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-600">Pago rechazado</span>
}
                </div>
              </div>
              @if (p.items?.length) {
                <ul class="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  @for (i of p.items; track i.id) {
                    <li class="text-sm font-semibold text-slate-700">{{ i.cantidad }}x {{ i.producto?.nombre }}</li>
                  }
                </ul>
              }
            </div>
          } @empty {
            <div class="py-12 text-center text-slate-700">
              <p>Todavía no hiciste ningún pedido.</p>
              <a routerLink="/" class="mt-4 inline-block font-bold text-brand-orange hover:underline">Ver restaurantes</a>
            </div>
          }
        </div>
      }
    </main>
  `,
})
export class MisPedidos implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
    private pagosSvc = inject(PagosService);
  protected pagos = signal<Record<number, string | null>>({});

  protected pedidos = signal<any[]>([]);
  protected cargado = signal(false);
  protected mensaje = signal('');

  protected ordenados = computed(() => [...this.pedidos()].sort((a, b) => b.id - a.id));

  protected monto = (v: any) => Number(v);
  protected etiqueta = (e: string) => ESTADOS[e] ?? e;

  async ngOnInit() {
    const u = this.auth.usuario();
    if (!u) {
      this.mensaje.set('Ingresá a tu cuenta para ver tus pedidos.');
      return;
    }
    try {
      this.pedidos.set(await firstValueFrom(this.http.get<any[]>(`${API}/pedidos?cliente_id=${u.id}`)));
            for (const p of this.pedidos()) {
        this.pagosSvc.estadoDelPedido(p.id).then(e =>
          this.pagos.update(m => ({ ...m, [p.id]: e })));
      }
      this.cargado.set(true);
    } catch {
      this.mensaje.set('No se pudo conectar con el servidor.');
    }
  }
}