import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Restaurante } from './restaurante/restaurante';
import { Seguimiento } from './seguimiento/seguimiento';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'seguimiento', component: Seguimiento },
  { path: '**', redirectTo: '' },
];