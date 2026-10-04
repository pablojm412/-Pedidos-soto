import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injector, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const API = 'http://localhost:3000';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('rrap_token');
  if (!token || !req.url.startsWith(API)) return next(req);

  // Se pide AuthService y Router recién cuando hacen falta, para no crear dependencias circulares
  const injector = inject(Injector);
  const conToken = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });

  return next(conToken).pipe(
    catchError((err: unknown) => {
      // Un 401 en /auth/* es "credenciales incorrectas", no una sesión vencida
      const esAuth = req.url.startsWith(`${API}/auth/`);

      if (err instanceof HttpErrorResponse && err.status === 401 && !esAuth) {
        const auth = injector.get(AuthService);
        // Si varias peticiones fallan a la vez, solo la primera cierra la sesión
        if (auth.token) {
          auth.logout();
          injector.get(Router).navigateByUrl('/');
          auth.abrirModal('login');
        }
      }
      return throwError(() => err);
    }),
  );
};