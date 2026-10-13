import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { EstadisticasGenerales, ReporteVentas } from '../models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  async getEstadisticas(): Promise<EstadisticasGenerales> {
    return firstValueFrom(
      this.http.get<EstadisticasGenerales>(`${API}/admin/estadisticas`)
    );
  }

  async getReporteVentas(filtros: { desde?: string; hasta?: string; comercioId?: number } = {}): Promise<ReporteVentas> {
    let params = new HttpParams();
    if (filtros.desde) params = params.set('desde', filtros.desde);
    if (filtros.hasta) params = params.set('hasta', filtros.hasta);
    if (filtros.comercioId) params = params.set('comercio_id', String(filtros.comercioId));

    return firstValueFrom(
      this.http.get<ReporteVentas>(`${API}/admin/reportes/ventas`, { params })
    );
  }
}