import { Injectable, signal } from '@angular/core';

const CLAVE = 'rrap_direccion';
const POR_DEFECTO = 'Av. Siempreviva 742';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  readonly direccion = signal<string>(this.leer());

  /** Devuelve false si la dirección no es válida. */
  cambiar(valor: string): boolean {
    const limpia = valor.trim();
    if (limpia.length < 3 || limpia.length > 120) return false;
    this.direccion.set(limpia);
    try { localStorage.setItem(CLAVE, limpia); } catch { /* sin almacenamiento */ }
    return true;
  }

  private leer(): string {
    try { return localStorage.getItem(CLAVE) || POR_DEFECTO; }
    catch { return POR_DEFECTO; }
  }
}