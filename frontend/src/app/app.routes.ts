import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Restaurante } from './restaurante/restaurante';
import { Seguimiento } from './seguimiento/seguimiento';
import { PanelComercio } from './panel-comercio/panel-comercio'; // Dependiendo de cómo se llame el archivo de comercio
import { PanelRepartidor } from './panel-repartidor/panel-repartidor';
import { MisPedidos } from './mis-pedidos/mis-pedidos';
import { PagoResultado } from './pago-resultado/pago-resultado';

// Cambiá la ruta de import según dónde tengas creado tu componente de Admin:
// import { AdminComponent } from './admin/admin'; 

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurante/:id', component: Restaurante },
  { path: 'seguimiento', component: Seguimiento },
  { path: 'seguimiento/:id', component: Seguimiento },
  { path: 'pago-resultado', component: PagoResultado },
  { path: 'mis-pedidos', component: MisPedidos },
  { path: 'comercio', component: PanelComercio },
  { path: 'repartidor', component: PanelRepartidor },
  
  // Agregamos la ruta del panel de administración aquí:
  // { path: 'admin', component: AdminComponent },
  
  { path: '**', redirectTo: '' },
];