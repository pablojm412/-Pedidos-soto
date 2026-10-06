import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

@Component({
  selector: 'app-panel-repartidor',
  imports: [DatePipe],
  template: `
    <main class="mx-auto max-w-4xl px-4 py-8">
      @if (mensaje()) {
        <p class="py-16 text-center font-semibold text-slate-800">{{ mensaje() }}</p>
      } @else if (cargado()) {
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black text-brand-blue">Panel de repartidor</h1>
            <p class="text-xs font-semibold text-slate-700">Se actualiza solo cada 8 segundos</p>
          </div>
          <span class="rounded-full bg-brand-orange px-3 py-1 text-sm font-bold text-white">{{ activos().length }} pedidos</span>
        </div>

        @if (error()) { <p class="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">{{ error() }}</p> }

        <div class="space-y-4">
          @for (p of activos(); track p.id) {
            <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-extrabold text-slate-800">Pedido #RRS-{{ p.id }}</h3>
                  <p class="text-xs text-slate-500">{{ p.creado_en | date:'HH:mm' }} · {{ p.comercio?.nombre }}</p>
                  <p class="mt-1 text-xs text-slate-500"><i class="fa-solid fa-location-dot mr-1 text-brand-orange"></i>{{ p.direccion_entrega }}</p>
                  <p class="text-xs text-slate-500">Cliente: {{ p.cliente?.nombre }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-extrabold text-brand-orange">{{ '$' + monto(p.total) }}</p>
                  <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange">
                    {{ p.estado === 'aceptado' ? 'En preparación' : 'En camino' }}
                  </span>
                </div>
              </div>
              @if (p.items?.length) {
                <ul class="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  @for (i of p.items; track i.id) {
                    <li class="text-sm font-semibold text-slate-700">{{ i.cantidad }}x {{ i.producto?.nombre }}</li>
                  }
                </ul>
              }
              @if (p.estado === 'en_camino') {
                <div class="mt-3">
                  <button (click)="entregar(p.id)" class="w-full rounded-xl bg-brand-orange py-2 text-sm font-bold text-white hover:bg-brand-lightorange">Marcar entregado</button>
                </div>
              }
            </div>
          } @empty {
            <p class="py-12 text-center font-medium text-slate-700">No hay pedidos para repartir 🛵</p>
          }
        </div>
      } @else {
        <p class="py-16 text-center font-semibold text-slate-800">Cargando...</p>
      }
    </main>
  `,
})
export class PanelRepartidor implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private timer?: ReturnType<typeof setInterval>;

  protected pedidos = signal<any[]>([]);
  protected cargado = signal(false);
  protected mensaje = signal('');
  protected error = signal('');

  protected activos = computed(() =>
    this.pedidos()
      .filter(p => p.estado === 'aceptado' || p.estado === 'en_camino')
      .sort((a, b) => b.id - a.id)
  );

  protected monto = (v: any) => Number(v);

  async ngOnInit() {
    const u = this.auth.usuario();
    if (!u || u.rol !== 'repartidor') {
      this.mensaje.set('Esta pantalla es solo para cuentas de repartidor. Cerrá sesión e ingresá con la cuenta correspondiente.');
      return;
    }
    await this.cargar();
    this.timer = setInterval(() => this.cargar(), 8000);
  }

  ngOnDestroy() { clearInterval(this.timer); }

  private async cargar() {
    try {
      this.pedidos.set(await firstValueFrom(this.http.get<any[]>(`${API}/pedidos`)));
      this.cargado.set(true);
    } catch {
      if (!this.cargado()) this.mensaje.set('No se pudo conectar con el servidor.');
    }
  }

  protected async entregar(id: number) {
    this.error.set('');
    try {
      await firstValueFrom(this.http.patch(`${API}/pedidos/${id}/estado`, { estado: 'entregado' }));
      await this.cargar();
    } catch {
      this.error.set('No se pudo marcar el pedido como entregado.');
    }
  }
}