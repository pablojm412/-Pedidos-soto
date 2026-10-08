import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class PagosService {
  private http = inject(HttpClient);

  /** Crea la preferencia de pago y devuelve la URL de Mercado Pago (sandbox). */
  async crear(pedidoId: number): Promise<{ url: string | null; error: string | null }> {
    try {
      const r: any = await firstValueFrom(this.http.post(`${API}/pagos`, { pedido_id: pedidoId }));
      const url = r.sandbox_init_point ?? r.init_point ?? null;
      return { url, error: url ? null : 'No se recibió el link de pago.' };
    } catch (e: any) {
      return { url: null, error: this.mensaje(e) };
    }
  }

  /** Consulta a Mercado Pago el estado de un pago. */
  async verificar(paymentId: string): Promise<{ estado: string | null; error: string | null }> {
    try {
      const r: any = await firstValueFrom(this.http.get(`${API}/pagos/verificar/${paymentId}`));
      return { estado: r.estado, error: null };
    } catch (e: any) {
      return { estado: null, error: this.mensaje(e) };
    }
  }

  /** Estado del pago de un pedido: 'aprobado', 'pendiente', 'rechazado' o null si no hay pago. */
  async estadoDelPedido(pedidoId: number): Promise<string | null> {
    try {
      const r: any = await firstValueFrom(this.http.get(`${API}/pagos/pedido/${pedidoId}`));
      return r?.estado ?? null;
    } catch {
      return null;
    }
  }

  /** Le pide al backend que revise en Mercado Pago si el pedido ya se pagó. Devuelve el estado actualizado. */
  async sincronizar(pedidoId: number): Promise<string | null> {
    try {
      const r: any = await firstValueFrom(this.http.post(`${API}/pagos/sincronizar/${pedidoId}`, {}));
      return r?.estado ?? null;
    } catch {
      return null;
    }
  }

  private mensaje(e: any): string {
    if (e?.status === 0) return 'No se pudo conectar con el servidor.';
    if (e?.status === 503) return 'Los pagos online no están disponibles por ahora.';
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join(', ') : (m ?? 'No se pudo procesar el pago.');
  }
}