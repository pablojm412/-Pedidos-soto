import { HttpInterceptorFn } from '@angular/common/http';

const API = 'http://localhost:3000';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('rrap_token');
  if (!token || !req.url.startsWith(API)) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};