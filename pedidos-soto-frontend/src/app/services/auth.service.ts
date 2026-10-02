import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Usuario } from '../models';

const API = 'http://localhost:3000';
type Pestania = 'login' | 'register' | 'forgot';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  readonly usuario = signal<Usuario | null>(this.leerUsuario());

  // Estado del modal de login (vive acá para poder abrirlo desde el carrito)
  readonly modal = signal<Pestania | null>(null);
  abrirModal(tab: Pestania = 'login') { this.modal.set(tab); }
  cerrarModal() { this.modal.set(null); }

  get token(): string | null {
    return localStorage.getItem('rrap_token');
  }

  /** Devuelve null si salió bien, o el mensaje de error. */
  async login(email: string, password: string): Promise<string | null> {
    try {
      const r = await firstValueFrom(
        this.http.post<{ access_token: string; usuario: { id: number; nombre: string; email: string; rol: string } }>(
          `${API}/auth/login`, { email, password }),
      );
      const u: Usuario = { id: r.usuario.id, name: r.usuario.nombre, email: r.usuario.email, rol: r.usuario.rol };
      localStorage.setItem('rrap_token', r.access_token);
      localStorage.setItem('rrap_user', JSON.stringify(u));
      this.usuario.set(u);
      return null;
    } catch (e: any) {
      return this.mensaje(e, 'Correo o contraseña incorrectos.');
    }
  }

  /** Registra y luego inicia sesión. Devuelve null si salió bien, o el mensaje de error. */
  async registrar(nombre: string, email: string, password: string): Promise<string | null> {
    try {
      await firstValueFrom(this.http.post(`${API}/auth/registro`, { nombre, email, password }));
    } catch (e: any) {
      return this.mensaje(e, 'No se pudo crear la cuenta.');
    }
    return this.login(email, password);
  }

  logout() {
    this.usuario.set(null);
    localStorage.removeItem('rrap_user');
    localStorage.removeItem('rrap_token');
  }

  private mensaje(e: any, porDefecto: string): string {
    if (e?.status === 0) return 'No se pudo conectar con el servidor.';
    const m = e?.error?.message;
    return Array.isArray(m) ? m.join(', ') : (m ?? porDefecto);
  }

  private leerUsuario(): Usuario | null {
    try { return JSON.parse(localStorage.getItem('rrap_user') ?? 'null'); }
    catch { return null; }
  }
}