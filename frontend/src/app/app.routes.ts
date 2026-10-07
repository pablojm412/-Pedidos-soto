import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Restaurante } from './restaurante/restaurante';
import { Seguimiento } from './seguimiento/seguimiento';
import { PanelComercio } from './panel-comercio/panel-comercio'; // Dependiendo de cómo se llame el archivo de comercio
import { PanelRepartidor } from './panel-repartidor/panel-repartidor';
import { MisPedidos } from './mis-pedidos/mis-pedidos';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'seguimiento', component: Seguimiento },
  { path: 'mis-pedidos', component: MisPedidos },
  { path: 'comercio', component: PanelComercio },
  { path: 'repartidor', component: PanelRepartidor },
  { path: '**', redirectTo: '' },
];