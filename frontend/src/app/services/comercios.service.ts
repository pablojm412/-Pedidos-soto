import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Categoria, Comercio, Producto } from '../models';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

// Datos que todavía no existen en la base (hablar con Pablo para agregarlos)
const IMAGENES: Record<string, string> = {
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
};
const IMAGEN_DEFECTO = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80';

@Injectable({ providedIn: 'root' })
export class ComerciosService {
  private http = inject(HttpClient);

  readonly categorias: Categoria[] = [
    { id: 'burgers', name: 'Hamburguesas', icon: 'fa-burger' },
    { id: 'pizza', name: 'Pizzas', icon: 'fa-pizza-slice' },
    { id: 'empanadas', name: 'Empanadas', icon: 'fa-pie-chart' },
    { id: 'sushi', name: 'Sushi', icon: 'fa-fish' },
    { id: 'drinks', name: 'Bebidas', icon: 'fa-wine-bottle' },
    { id: 'icecream', name: 'Helados', icon: 'fa-ice-cream' },
  ];

  readonly busqueda = signal('');
  readonly comercios = signal<Comercio[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set('');
    this.http.get<any[]>(`${API}/comercios`).pipe(
      switchMap(lista =>
        lista.length
          ? forkJoin(lista.map(c =>
              this.http.get<any[]>(`${API}/productos/comercio/${c.id}`).pipe(
                catchError(() => of([])),
                map(prods => this.adaptar(c, prods)),
              )))
          : of([] as Comercio[]),
      ),
    ).subscribe({
      next: lista => { this.comercios.set(lista); this.cargando.set(false); },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      },
    });
  }

  porId(id: number): Comercio | undefined {
    return this.comercios().find(c => c.id === id);
  }

  private adaptar(c: any, prods: any[]): Comercio {
    return {
      id: c.id,
      name: c.nombre,
      category: c.categoria,
      rating: 4.5,                 // TODO: no existe en la base
      deliveryTime: '25-35 min',   // TODO: no existe en la base
      isFreeDelivery: Number(c.costo_envio_base) === 0,
      costoEnvio: Number(c.costo_envio_base),
      image: IMAGENES[c.categoria] ?? IMAGEN_DEFECTO,  // TODO: no existe en la base
      products: prods
        .filter(p => p.disponible)
        .map((p): Producto => ({
          id: p.id, name: p.nombre, price: Number(p.precio), desc: p.descripcion ?? '',
        })),
    };
  }
}