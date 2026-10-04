import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CarritoService } from './services/carrito.service';
import { AuthService } from './services/auth.service';
import { ComerciosService } from './services/comercios.service';
import { AuthModal } from './auth-modal/auth-modal';
import { CarritoDrawer } from './carrito-drawer/carrito-drawer';
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, AuthModal, CarritoDrawer],
  template: `
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between gap-4">
          <div class="flex items-center gap-6">
            <a routerLink="/" class="group flex items-center gap-3">
              <div class="flex h-14 items-center justify-center rounded-xl border border-slate-100 bg-white px-2 shadow-md transition-transform group-hover:scale-105">
                <img src="logo.jpeg" alt="RRap i Soto" class="h-12 object-contain">
              </div>
              <div class="hidden flex-col sm:flex">
                <span class="text-xl font-extrabold leading-none tracking-tight text-brand-blue">RRap <span class="italic text-brand-orange">i</span> Soto</span>
                <span class="text-[9px] font-semibold tracking-wider text-slate-400">DELIVERY APP</span>
              </div>
            </a>
            <button class="flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1.5 text-left text-xs transition-all hover:bg-slate-200/60 sm:text-sm">
              <i class="fa-solid fa-location-dot text-base text-brand-orange"></i>
              <div class="max-w-[120px] truncate sm:max-w-[200px]">
                <span class="block text-[10px] font-semibold uppercase leading-none tracking-wider text-slate-400">Entregar en</span>
                <span class="block truncate font-semibold text-slate-700">Av. Siempreviva 742</span>
              </div>
              <i class="fa-solid fa-chevron-down ml-1 text-xs text-slate-400"></i>
            </button>
          </div>

          <div class="relative hidden max-w-md flex-1 md:flex">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" (input)="comercios.busqueda.set($any($event.target).value)"
              placeholder="Te llevamos lo que quieras en la comodidad de un click..."
              class="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30">
          </div>

          <div class="flex items-center gap-3">
            <button (click)="carrito.abierto.set(true)" class="relative rounded-xl bg-orange-50 p-2.5 text-brand-orange transition-all hover:bg-orange-100">
              <i class="fa-solid fa-basket-shopping text-lg"></i>
              <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-orange text-[10px] font-bold text-white transition-transform"
                    [class.scale-0]="carrito.cantidad() === 0">{{ carrito.cantidad() }}</span>
            </button>

            @if (auth.usuario(); as u) {
              <div class="flex items-center gap-2">
                <div class="hidden flex-col text-right sm:flex">
                  <span class="text-xs font-bold leading-none text-slate-800">{{ u.name }}</span>
                  <span class="text-[10px] font-semibold text-slate-400">{{ u.email }}</span>
                </div>
                <div class="group relative">
                  <button class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-orange font-extrabold text-white shadow-md">
                    {{ u.name.charAt(0).toUpperCase() }}
                  </button>
                  <div class="absolute right-0 z-50 hidden w-48 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl group-hover:block">
                    <a routerLink="/mis-pedidos" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <i class="fa-solid fa-receipt mr-2 text-brand-orange"></i>Mis Pedidos
                    </a>
                    @if (u.rol === 'comercio') {
                      <a routerLink="/comercio" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <i class="fa-solid fa-store mr-2 text-brand-orange"></i>Panel del comercio
                      </a>
                    }
                    @if (u.rol === 'repartidor') {
                      <a routerLink="/repartidor" class="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        <i class="fa-solid fa-motorcycle mr-2 text-brand-orange"></i>Panel de repartidor
                      </a>
                    }
                    <button (click)="auth.logout()" class="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50">
                      <i class="fa-solid fa-right-from-bracket mr-2"></i>Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <button (click)="auth.abrirModal('login')"
                class="flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-blue/20 transition-all hover:bg-brand-darkblue sm:text-sm">
                <i class="fa-regular fa-user"></i><span>Ingresar</span>
              </button>
            }
          </div>
        </div>

        <div class="pb-3 md:hidden">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input type="text" (input)="comercios.busqueda.set($any($event.target).value)" placeholder="Buscar en RRap i Soto..."
              class="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange">
          </div>
        </div>
      </div>
    </header>

    <router-outlet />
    <app-carrito-drawer />
    <app-auth-modal />
  `,
})
export class App {
  protected carrito = inject(CarritoService);
  protected auth = inject(AuthService);
  protected comercios = inject(ComerciosService);
}