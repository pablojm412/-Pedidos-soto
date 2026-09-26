import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ComerciosModule } from './comercios/comercios.module';
import { ProductosModule } from './productos/productos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PagosModule } from './pagos/pagos.module';

@Module({
  imports: [UsuariosModule, ComerciosModule, ProductosModule, PedidosModule, PagosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
