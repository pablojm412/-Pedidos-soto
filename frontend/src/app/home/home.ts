import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ComerciosService } from '../services/comercios.service';
import { CarritoService } from '../services/carrito.service';

type Rapido = 'all' | 'top' | 'free_delivery' | 'fast';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section class="no-scrollbar flex gap-4 overflow-x-auto py-2">
        @for (b of banners; track b.titulo) {
          <div class="relative flex h-40 min-w-[280px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:min-w-[360px]" [class]="b.fondo">
            <div class="z-10 max-w-[60%]">
              <span class="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md" [class]="b.etiqueta">{{ b.tag }}</span>
              <h3 class="mt-2 text-xl font-black leading-tight">{{ b.titulo }}</h3>
              <p class="mt-1 text-xs" [class]="b.sub">{{ b.texto }}</p>
            </div>
            <img [src]="b.img" [alt]="b.tag" class="absolute -bottom-6 -right-6 h-44 w-44 rounded-full object-cover shadow-2xl" [class]="b.giro">
          </div>
        }
      </section>

      <section>
        <h2 class="mb-4 text-lg font-extrabold text-brand-blue">¿Qué se te antoja hoy?</h2>
        <div class="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          @for (cat of categorias; track cat.id) {
            <button (click)="alternarCategoria(cat.id)"
              class="group flex min-w-[90px] shrink-0 flex-col items-center gap-2 rounded-2xl border bg-white p-3 shadow-sm transition-all hover:border-brand-orange/30 hover:shadow-md"
              [class.border-brand-orange]="categoria() === cat.id" [class.border-slate-100]="categoria() !== cat.id">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl text-brand-orange transition-transform group-hover:scale-110">
                <i class="fa-solid" [class]="cat.icon"></i>
              </div>
              <span class="text-xs font-bold text-slate-700">{{ cat.name }}</span>
            </button>
          }
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
          <h2 class="text-xl font-extrabold text-brand-blue">Restaurantes cerca tuyo</h2>
          <div class="no-scrollbar flex gap-2 overflow-x-auto">
            @for (f of filtrosRapidos; track f.id) {
              <button (click)="rapido.set(f.id)" class="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
                [class]="rapido() === f.id ? 'bg-brand-blue text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'">
                {{ f.label }}
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (c of lista(); track c.id) {
            <a [routerLink]="['/restaurante', c.id]"
              class="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-xl">
              <div class="relative h-44 overflow-hidden">
                <img [src]="c.image" [alt]="c.name" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105">
                <div class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow backdrop-blur-md">⭐ {{ c.rating }}</div>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-extrabold text-slate-800 transition-colors group-hover:text-brand-orange">{{ c.name }}</h3>
                <div class="mt-2 flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span><i class="fa-regular fa-clock mr-1"></i>{{ c.deliveryTime }}</span><span>•</span>
                  <span [class.text-emerald-600]="c.isFreeDelivery" [class.font-bold]="c.isFreeDelivery">
                    {{ c.isFreeDelivery ? 'Envío Gratis' : 'Envío $' + c.costoEnvio }}
                  </span>
                </div>
              </div>
            </a>
          } @empty {
            <p class="col-span-full py-8 text-center text-slate-400">No se encontraron locales.</p>
          }
        </div>
      </section>
    </main>
  `,
})
export class Home {
  private svc = inject(ComerciosService);
  protected carrito = inject(CarritoService);
  protected categorias = this.svc.categorias;

  protected banners = [
    { fondo: 'bg-gradient-to-r from-brand-blue to-brand-darkblue shadow-brand-blue/20', etiqueta: 'bg-brand-orange/90', sub: 'text-slate-300', giro: 'rotate-12',
      tag: 'Envío Gratis', titulo: '30% OFF en Hamburguesas', texto: 'Sabor real a la parrilla',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
    { fondo: 'bg-gradient-to-r from-brand-orange to-brand-lightorange shadow-brand-orange/20', etiqueta: 'bg-white/20', sub: 'text-orange-100', giro: '-rotate-12',
      tag: 'Noches de Pizza', titulo: '2x1 en Pizzas Familiares', texto: 'Masa madre crujiente',
      img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80' },
    { fondo: 'bg-gradient-to-r from-emerald-600 to-teal-700 shadow-emerald-500/20', etiqueta: 'bg-white/20', sub: 'text-emerald-100', giro: '',
      tag: 'Saludable', titulo: 'Sushi & Bowls Frescos', texto: 'Ingredientes premium',
      img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80' },
  ];

  protected filtrosRapidos: { id: Rapido; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'top', label: '⭐ Más valorados' },
    { id: 'free_delivery', label: '🛵 Envío Gratis' },
    { id: 'fast', label: '⚡ Menos de 30 min' },
  ];

  protected categoria = signal<string | null>(null);
  protected rapido = signal<Rapido>('all');

  protected lista = computed(() => {
    const q = this.svc.busqueda().toLowerCase().trim();
    const cat = this.categoria();
    const r = this.rapido();
    return this.svc.comercios().filter(c =>
      (!cat || c.category === cat) &&
      c.name.toLowerCase().includes(q) &&
      (r === 'all' ||
        (r === 'top' && c.rating >= 4.7) ||
        (r === 'free_delivery' && c.isFreeDelivery) ||
        (r === 'fast' && parseInt(c.deliveryTime) <= 30))
    );
  });

  protected alternarCategoria(id: string) {
    this.categoria.update(a => (a === id ? null : id));
  }
}