import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Restaurante } from './restaurante/restaurante';
import { Seguimiento } from './seguimiento/seguimiento';
import { PanelComercio } from './panel-comercio/panel-comercio';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'seguimiento', component: Seguimiento },
  { path: 'comercio', component: PanelComercio },
  { path: '**', redirectTo: '' },
];