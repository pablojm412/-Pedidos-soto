import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

const SIGUIENTE: Record<string, { estado: string; texto: string }> = {
  pendiente: { estado: 'aceptado', texto: 'Aceptar pedido' },
  aceptado: { estado: 'en_camino', texto: 'Enviar con repartidor' },
  en_camino: { estado: 'entregado', texto: 'Marcar entregado' },
};

@Component({
  selector: 'app-panel-comercio',
  imports: [DatePipe],
  template: `
    <main class="mx-auto max-w-4xl px-4 py-8">
      @if (mensaje()) {
        <p class="py-16 text-center font-semibold text-slate-800">{{ mensaje() }}</p>
      } @else if (comercio(); as c) {
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-black text-brand-blue">Panel de {{ c.nombre }}</h1>
            <p class="text-xs font-semibold text-slate-700">Se actualiza solo cada 8 segundos</p>
          </div>
          <span class="rounded-full bg-brand-orange px-3 py-1 text-sm font-bold text-white">{{ activos().length }} activos</span>
        </div>

        @if (error()) { <p class="mb-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">{{ error() }}</p> }

        <div class="space-y-4">
          @for (p of activos(); track p.id) {
            <div class="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="font-extrabold text-slate-800">Pedido #RRS-{{ p.id }}</h3>
                  <p class="text-xs text-slate-500">{{ p.creado_en | date:'HH:mm' }} · {{ p.cliente?.nombre }}</p>
                  <p class="mt-1 text-xs text-slate-500"><i class="fa-solid fa-location-dot mr-1 text-brand-orange"></i>{{ p.direccion_entrega }}</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-extrabold text-brand-orange">{{ '$' + monto(p.total) }}</p>
                  <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-orange">{{ p.estado }}</span>
                </div>
              </div>
              @if (p.items?.length) {
                <ul class="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  @for (i of p.items; track i.id) {
                    <li class="text-sm font-semibold text-slate-700">{{ i.cantidad }}x {{ i.producto?.nombre }}</li>
                  }
                </ul>
              }
              <div class="mt-3 flex gap-2">
                @if (siguiente(p.estado); as s) {
                  <button (click)="cambiar(p.id, s.estado)" class="flex-1 rounded-xl bg-brand-orange py-2 text-sm font-bold text-white hover:bg-brand-lightorange">{{ s.texto }}</button>
                }
                @if (p.estado === 'pendiente' || p.estado === 'aceptado') {
                  <button (click)="cambiar(p.id, 'cancelado')" class="rounded-xl border border-rose-200 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">Cancelar</button>
                }
              </div>
            </div>
          } @empty {
            <p class="py-12 text-center font-medium text-slate-700">No hay pedidos activos 🎉</p>
          }
        </div>
      } @else {
        <p class="py-16 text-center font-semibold text-slate-800">Cargando...</p>
      }
    </main>
  `,
})
export class PanelComercio implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private timer?: ReturnType<typeof setInterval>;

  protected comercio = signal<any | null>(null);
  protected pedidos = signal<any[]>([]);
  protected mensaje = signal('');
  protected error = signal('');

  protected activos = computed(() =>
    this.pedidos()
      .filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado')
      .sort((a, b) => b.id - a.id)
  );

  protected monto = (v: any) => Number(v);
  protected siguiente = (estado: string) => SIGUIENTE[estado];

  async ngOnInit() {
    const u = this.auth.usuario();
    if (!u || u.rol !== 'comercio') {
      this.mensaje.set('Esta pantalla es solo para cuentas de comercio. Cerrá sesión e ingresá con la cuenta del local.');
      return;
    }
    try {
      const lista = await firstValueFrom(this.http.get<any[]>(`${API}/comercios`));
      const mio = lista.find(c => c.usuario_id === u.id);
      if (!mio) { this.mensaje.set('Tu cuenta no tiene un comercio asignado.'); return; }
      this.comercio.set(mio);
      await this.cargar();
      this.timer = setInterval(() => this.cargar(), 8000);
    } catch {
      this.mensaje.set('No se pudo conectar con el servidor.');
    }
  }

  ngOnDestroy() { clearInterval(this.timer); }

  private async cargar() {
    const c = this.comercio();
    if (!c) return;
    try {
      this.pedidos.set(await firstValueFrom(this.http.get<any[]>(`${API}/pedidos?comercio_id=${c.id}`)));
    } catch { /* se reintenta en el próximo ciclo */ }
  }

  protected async cambiar(id: number, estado: string) {
    this.error.set('');
    try {
      await firstValueFrom(this.http.patch(`${API}/pedidos/${id}/estado`, { estado }));
      await this.cargar();
    } catch {
      this.error.set('No se pudo cambiar el estado del pedido.');
    }
  }
}
