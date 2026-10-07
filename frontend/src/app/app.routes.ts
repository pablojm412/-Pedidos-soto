import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Restaurante } from './restaurante/restaurante';
import { Seguimiento } from './seguimiento/seguimiento';
import { PanelComercio } from './panel-comercio/panel-comercio';
import { PanelRepartidor } from './panel-repartidor/panel-repartidor';
import { MisPedidos } from './mis-pedidos/mis-pedidos';
import { PagoResultado } from './pago-resultado/pago-resultado';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'seguimiento', component: Seguimiento },
  { path: 'seguimiento/:id', component: Seguimiento },
  { path: 'pago-resultado', component: PagoResultado },
  { path: 'mis-pedidos', component: MisPedidos },
  { path: 'comercio', component: PanelComercio },
  { path: 'repartidor', component: PanelRepartidor },
  { path: '**', redirectTo: '' },
];