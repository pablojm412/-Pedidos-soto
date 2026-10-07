import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PagosService } from '../services/pagos.service';

@Component({
  selector: 'app-pago-resultado',
  imports: [RouterLink],
  template: `
    <main class="mx-auto max-w-md px-4 py-12 text-center">
      @if (cargando()) {
        <p class="font-semibold text-slate-800">Verificando tu pago...</p>
      } @else if (error()) {
        <h1 class="text-2xl font-black text-rose-600">No pudimos verificar el pago</h1>
        <p class="mt-2 text-sm text-slate-700">{{ error() }}</p>
      } @else if (estado() === 'aprobado') {
        <h1 class="text-2xl font-black text-emerald-600">¡Pago aprobado!</h1>
        <p class="mt-2 text-sm text-slate-700">Tu pedido está confirmado.</p>
      } @else if (estado() === 'rechazado') {
        <h1 class="text-2xl font-black text-rose-600">Pago rechazado</h1>
        <p class="mt-2 text-sm text-slate-700">No se realizó ningún cobro.</p>
      } @else {
        <h1 class="text-2xl font-black text-brand-orange">Pago pendiente</h1>
        <p class="mt-2 text-sm text-slate-700">Todavía no se acreditó. Revisá más tarde en Mis pedidos.</p>
      }

      @if (!cargando()) {
        <a routerLink="/mis-pedidos" class="mt-6 inline-block rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white">Ver mis pedidos</a>
      }
    </main>
  `,
})
export class PagoResultado implements OnInit {
  private route = inject(ActivatedRoute);
  private pagos = inject(PagosService);

  protected cargando = signal(true);
  protected estado = signal<string | null>(null);
  protected error = signal('');

  async ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    const paymentId = q.get('payment_id') ?? q.get('collection_id');
    if (!paymentId) {
      this.error.set('No se recibió el número de pago.');
      this.cargando.set(false);
      return;
    }
    const r = await this.pagos.verificar(paymentId);
    if (r.error) this.error.set(r.error); else this.estado.set(r.estado);
    this.cargando.set(false);
  }
}