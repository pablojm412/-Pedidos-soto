import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ComerciosService } from '../services/comercios.service';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-restaurante',
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <a routerLink="/" class="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-orange">
        <i class="fa-solid fa-arrow-left"></i> Volver a restaurantes
      </a>

      @if (comercio(); as c) {
        <div class="relative mb-6 h-48 overflow-hidden rounded-3xl sm:h-64">
          <img [src]="c.image" [alt]="c.name" class="h-full w-full object-cover">
          <div class="absolute inset-0 flex items-end bg-gradient-to-t from-slate-900/80 to-transparent p-6">
            <div class="text-white">
              <h1 class="text-3xl font-black">{{ c.name }}</h1>
              <p class="mt-1 text-sm opacity-90">⭐ {{ c.rating }} | {{ c.deliveryTime }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          @for (p of c.products; track p.id) {
            <div class="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div>
                <h4 class="font-bold text-slate-800">{{ p.name }}</h4>
                <p class="mt-1 text-xs text-slate-400">{{ p.desc }}</p>
                <p class="mt-2 text-sm font-extrabold text-brand-orange">{{ '$' + p.price }}</p>
              </div>
                 <button (click)="carrito.agregar(c.id, c.costoEnvio, p.id, p.name, p.price)"
                class="rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-bold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white">
                + Agregar
              </button>
            </div>
          }
        </div>
      } @else {
        <p class="py-12 text-center text-slate-400">No encontramos este local.</p>
      }
    </main>
  `,
})
export class Restaurante {
  private comercios = inject(ComerciosService);
  protected carrito = inject(CarritoService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected comercio = computed(() => this.comercios.porId(this.id));
}