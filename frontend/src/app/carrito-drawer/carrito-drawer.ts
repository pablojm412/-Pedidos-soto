import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService } from '../services/carrito.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-carrito-drawer',
  template: `
    <div (click)="carrito.abierto.set(false)"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
      [class.opacity-0]="!carrito.abierto()" [class.pointer-events-none]="!carrito.abierto()"></div>

    <aside class="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px]"
      [class.translate-x-full]="!carrito.abierto()">
      <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-bag-shopping text-lg text-brand-orange"></i>
          <h3 class="font-bold text-brand-blue">Tu Carrito</h3>
        </div>
        <button (click)="carrito.abierto.set(false)" class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="flex-1 space-y-4 overflow-y-auto p-4">
        @for (item of carrito.items(); track item.id; let i = $index) {
          <div class="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div>
              <h5 class="text-xs font-bold text-slate-800">{{ item.name }}</h5>
              <span class="text-xs font-bold text-brand-orange">{{ '$' + item.price * item.qty }}</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
              <button (click)="carrito.cambiarCantidad(i, -1)" class="px-1 text-xs font-bold text-slate-500">-</button>
              <span class="text-xs font-bold text-slate-700">{{ item.qty }}</span>
              <button (click)="carrito.cambiarCantidad(i, 1)" class="px-1 text-xs font-bold text-slate-500">+</button>
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center font-medium text-slate-400">Tu carrito está vacío 🛒</div>
        }
      </div>

      @if (carrito.items().length) {
        <div class="space-y-3 border-t border-slate-200 bg-white p-4">
          <div>
            <label class="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Propina para el repartidor</label>
            <div class="grid grid-cols-4 gap-2">
              @for (t of carrito.opcionesTip; track t) {
                <button (click)="carrito.tip.set(t)" class="rounded-lg border py-1.5 text-xs font-semibold"
                  [class]="carrito.tip() === t ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-slate-200 hover:bg-slate-50'">
                  {{ t === 0 ? 'Sin tip' : '$' + t }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-1.5 border-t border-slate-100 pt-2 text-xs text-slate-600">
            <div class="flex justify-between"><span>Subtotal</span><span class="font-medium">{{ '$' + carrito.subtotal() }}</span></div>
            <div class="flex justify-between"><span>Costo de envío</span><span class="font-medium">{{ '$' + carrito.costoEnvio() }}</span></div>
            <div class="flex justify-between"><span>Propina</span><span class="font-medium">{{ '$' + carrito.tip() }}</span></div>
            <div class="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
              <span>Total</span><span class="text-brand-orange">{{ '$' + carrito.total() }}</span>
            </div>
          </div>

          @if (error()) { <p class="text-center text-xs font-semibold text-rose-600">{{ error() }}</p> }

          <button (click)="hacerPedido()"
            class="flex w-full items-center justify-between rounded-2xl bg-brand-orange px-4 py-3.5 font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:bg-brand-lightorange">
            <span>Hacer Pedido</span><i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      }
    </aside>
  `,
})
export class CarritoDrawer {
  protected carrito = inject(CarritoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  protected error = signal('');

  protected async hacerPedido() {
    if (!this.auth.usuario()) {
      this.carrito.abierto.set(false);
      this.auth.abrirModal('login');
      return;
    }
        const err = await this.carrito.confirmar();
    if (err) { this.error.set(err); return; }
    this.error.set('');
    if (this.carrito.urlPago) {
      window.location.href = this.carrito.urlPago;
      return;
    }
        const id = this.carrito.ultimoPedido()?.id;
this.router.navigate(id ? ['/seguimiento', id] : ['/seguimiento']);
  }
}