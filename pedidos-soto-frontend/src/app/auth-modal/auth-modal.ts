import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

const INPUT = 'w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-orange focus:bg-white focus:outline-none';
const LABEL = 'mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600';

@Component({
  selector: 'app-auth-modal',
  imports: [FormsModule],
  template: `
    @if (auth.modal(); as tab) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" (click)="cerrar()">
        <div class="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl" (click)="$event.stopPropagation()">
          <button (click)="cerrar()" class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200">
            <i class="fa-solid fa-xmark"></i>
          </button>

          @if (tab === 'login') {
            <div class="space-y-4">
              <div class="mb-6 text-center">
                <h3 class="text-2xl font-black text-brand-blue">¡Hola de nuevo!</h3>
                <p class="mt-1 text-xs text-slate-500">Ingresa a tu cuenta de RRap i Soto</p>
              </div>
              <form (ngSubmit)="login()" class="space-y-3">
                <div>
                  <label class="${LABEL}">Correo Electrónico</label>
                  <div class="relative">
                    <i class="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="email" type="email" [(ngModel)]="email" required placeholder="tu@email.com" class="${INPUT}">
                  </div>
                </div>
                <div>
                  <div class="mb-1 flex items-center justify-between">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-600">Contraseña</label>
                    <button type="button" (click)="ir('forgot')" class="text-xs font-semibold text-brand-orange hover:underline">¿Olvidaste tu contraseña?</button>
                  </div>
                  <div class="relative">
                    <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="password" type="password" [(ngModel)]="password" required placeholder="••••••••" class="${INPUT}">
                  </div>
                </div>
                <button type="submit" class="mt-2 w-full rounded-xl bg-brand-orange py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:bg-brand-lightorange">Iniciar Sesión</button>
              </form>
              <div class="border-t border-slate-100 pt-3 text-center text-xs text-slate-600">
                ¿No tienes una cuenta? <button (click)="ir('register')" class="font-bold text-brand-blue hover:underline">Regístrate gratis</button>
              </div>
            </div>
          }

          @if (tab === 'register') {
            <div class="space-y-4">
              <div class="mb-6 text-center">
                <h3 class="text-2xl font-black text-brand-blue">Crea tu cuenta</h3>
                <p class="mt-1 text-xs text-slate-500">Disfruta de tus pedidos más rápido</p>
              </div>
              <form (ngSubmit)="registrar()" class="space-y-3">
                <div>
                  <label class="${LABEL}">Nombre Completo</label>
                  <div class="relative">
                    <i class="fa-regular fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="nombre" [(ngModel)]="nombre" required placeholder="Juan Pérez" class="${INPUT}">
                  </div>
                </div>
                <div>
                  <label class="${LABEL}">Correo Electrónico</label>
                  <div class="relative">
                    <i class="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="email" type="email" [(ngModel)]="email" required placeholder="tu@email.com" class="${INPUT}">
                  </div>
                </div>
                <div>
                  <label class="${LABEL}">Contraseña</label>
                  <div class="relative">
                    <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="password" type="password" [(ngModel)]="password" required minlength="6" placeholder="Mínimo 6 caracteres" class="${INPUT}">
                  </div>
                </div>
                <button type="submit" class="mt-2 w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 transition-all hover:bg-brand-darkblue">Crear Cuenta</button>
              </form>
              <div class="border-t border-slate-100 pt-3 text-center text-xs text-slate-600">
                ¿Ya tienes cuenta? <button (click)="ir('login')" class="font-bold text-brand-orange hover:underline">Inicia Sesión</button>
              </div>
            </div>
          }

          @if (tab === 'forgot') {
            <div class="space-y-4">
              <div class="mb-6 text-center">
                <h3 class="text-2xl font-black text-brand-blue">Recupera tu contraseña</h3>
                <p class="mt-1 text-xs text-slate-500">Te enviaremos las instrucciones a tu correo</p>
              </div>
              <form (ngSubmit)="recuperar()" class="space-y-3">
                <div>
                  <label class="${LABEL}">Correo Electrónico registrado</label>
                  <div class="relative">
                    <i class="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400"></i>
                    <input name="email" type="email" [(ngModel)]="email" required placeholder="tu@email.com" class="${INPUT}">
                  </div>
                </div>
                <button type="submit" class="mt-2 w-full rounded-xl bg-brand-orange py-3 text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:bg-brand-lightorange">Enviar Enlace de Recuperación</button>
              </form>
              <div class="border-t border-slate-100 pt-3 text-center text-xs">
                <button (click)="ir('login')" class="font-bold text-slate-600 hover:text-brand-blue">
                  <i class="fa-solid fa-arrow-left mr-1"></i> Volver al Inicio de Sesión
                </button>
              </div>
            </div>
          }

          @if (mensaje()) {
            <p class="mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs font-semibold text-slate-600">{{ mensaje() }}</p>
          }
        </div>
      </div>
    }
  `,
})
export class AuthModal {
  protected auth = inject(AuthService);
  protected mensaje = signal('');
  protected cargando = signal(false);
  protected nombre = '';
  protected email = '';
  protected password = '';

  protected ir(tab: 'login' | 'register' | 'forgot') {
    this.mensaje.set('');
    this.auth.abrirModal(tab);
  }

  protected cerrar() {
    this.mensaje.set('');
    this.nombre = this.email = this.password = '';
    this.auth.cerrarModal();
  }

  protected async login() {
    this.cargando.set(true);
    const error = await this.auth.login(this.email.trim(), this.password);
    this.cargando.set(false);
    if (error) this.mensaje.set(error); else this.cerrar();
  }

  protected async registrar() {
    this.cargando.set(true);
    const error = await this.auth.registrar(this.nombre.trim(), this.email.trim(), this.password);
    this.cargando.set(false);
    if (error) this.mensaje.set(error); else this.cerrar();
  }

  protected recuperar() {
    this.mensaje.set('Si el correo está registrado, recibirás un enlace de recuperación.');
  }
}