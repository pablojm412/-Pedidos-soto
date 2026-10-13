import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import { EstadisticasGenerales, ReporteVentas } from '../models';

type Tab = 'dashboard' | 'reportes';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-extrabold text-brand-blue sm:text-3xl">Panel de Administración</h1>
          <p class="text-sm text-slate-500">Control general de RRap i Soto</p>
        </div>
        <div class="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange text-white shadow-md">
          <i class="fa-solid fa-shield-halved text-lg"></i>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6 flex gap-2 border-b border-slate-200">
        <button (click)="tab.set('dashboard')"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
          [class.text-brand-orange]="tab() === 'dashboard'"
          [class.border-b-2]="tab() === 'dashboard'"
          [class.border-brand-orange]="tab() === 'dashboard'"
          [class.text-slate-500]="tab() !== 'dashboard'">
          <i class="fa-solid fa-chart-line"></i> Estadísticas
        </button>
        <button (click)="tab.set('reportes')"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
          [class.text-brand-orange]="tab() === 'reportes'"
          [class.border-b-2]="tab() === 'reportes'"
          [class.border-brand-orange]="tab() === 'reportes'"
          [class.text-slate-500]="tab() !== 'reportes'">
          <i class="fa-solid fa-file-invoice-dollar"></i> Reportes
        </button>
      </div>

      @if (cargando()) {
        <div class="flex items-center justify-center py-20 text-slate-400">
          <i class="fa-solid fa-circle-notch fa-spin mr-3 text-2xl"></i> Cargando...
        </div>
      }

      <!-- TAB DASHBOARD -->
      @if (tab() === 'dashboard' && !cargando() && stats(); as s) {
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Comercios</span>
              <i class="fa-solid fa-store text-brand-orange"></i>
            </div>
            <p class="mt-2 text-3xl font-extrabold text-brand-blue">{{ s.totalComercios }}</p>
            <p class="text-xs text-slate-500">{{ s.comerciosActivos }} activos</p>
          </div>

          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Pedidos</span>
              <i class="fa-solid fa-receipt text-brand-orange"></i>
            </div>
            <p class="mt-2 text-3xl font-extrabold text-brand-blue">{{ s.totalPedidos }}</p>
            <p class="text-xs text-slate-500">{{ s.pedidosEntregados }} entregados</p>
          </div>

          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Ventas totales</span>
              <i class="fa-solid fa-sack-dollar text-brand-orange"></i>
            </div>
            <p class="mt-2 text-3xl font-extrabold text-emerald-600">
              {{ s.ventasTotales | currency:'ARS':'symbol-narrow':'1.0-0' }}
            </p>
            <p class="text-xs text-slate-500">Solo pedidos entregados</p>
          </div>
        </div>
      }

      <!-- TAB REPORTES -->
      @if (tab() === 'reportes' && !cargando() && reporte(); as r) {
        <div class="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:grid-cols-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Desde</label>
            <input type="date" [(ngModel)]="desde"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">Hasta</label>
            <input type="date" [(ngModel)]="hasta"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none">
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-slate-500">ID Comercio</label>
            <input type="number" [(ngModel)]="comercioId" placeholder="Todos"
              class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none">
          </div>
          <div class="flex items-end">
            <button (click)="aplicarFiltros()"
              class="w-full rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-darkblue">
              <i class="fa-solid fa-filter mr-2"></i>Filtrar
            </button>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap gap-4">
          <div class="rounded-xl bg-orange-50 px-4 py-2 text-sm">
            <span class="font-semibold text-brand-orange">{{ r.cantidadPedidos }}</span>
            <span class="text-slate-600"> pedidos</span>
          </div>
          <div class="rounded-xl bg-emerald-50 px-4 py-2 text-sm">
            <span class="font-semibold text-emerald-600">
              {{ r.totalVendido | currency:'ARS':'symbol-narrow':'1.0-0' }}
            </span>
            <span class="text-slate-600"> vendidos</span>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-4 py-3">#</th>
                  <th class="px-4 py-3">Fecha</th>
                  <th class="px-4 py-3">Comercio</th>
                  <th class="px-4 py-3">Cliente</th>
                  <th class="px-4 py-3">Estado</th>
                  <th class="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (p of r.pedidos; track p.id) {
                  <tr class="hover:bg-slate-50/60">
                    <td class="px-4 py-3 font-semibold text-slate-700">#{{ p.id }}</td>
                    <td class="px-4 py-3 text-slate-500">{{ p.creado_en | date:'dd/MM/yy HH:mm' }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ p.comercio_id }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ p.cliente_id }}</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {{ p.estado }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-brand-blue">
                      {{ p.total | currency:'ARS':'symbol-narrow':'1.0-0' }}
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="px-4 py-10 text-center text-slate-400">Sin pedidos en el rango</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboard implements OnInit {
  private adminSrv = inject(AdminService);

  protected tab = signal<Tab>('dashboard');
  protected cargando = signal(false);
  protected stats = signal<EstadisticasGenerales | null>(null);
  protected reporte = signal<ReporteVentas | null>(null);

  protected desde = '';
  protected hasta = '';
  protected comercioId: number | null = null;

  async ngOnInit() {
    await this.cargarTodo();
  }

  private async cargarTodo() {
    this.cargando.set(true);
    try {
      const [stats, reporte] = await Promise.all([
        this.adminSrv.getEstadisticas(),
        this.adminSrv.getReporteVentas(),
      ]);
      this.stats.set(stats);
      this.reporte.set(reporte);
    } catch (e) {
      console.error('Error cargando panel admin', e);
      alert('No se pudo cargar el panel. Verificá tu sesión.');
    } finally {
      this.cargando.set(false);
    }
  }

  protected async aplicarFiltros() {
    this.cargando.set(true);
    try {
      const r = await this.adminSrv.getReporteVentas({
        desde: this.desde || undefined,
        hasta: this.hasta || undefined,
        comercioId: this.comercioId ?? undefined,
      });
      this.reporte.set(r);
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando.set(false);
    }
  }
}