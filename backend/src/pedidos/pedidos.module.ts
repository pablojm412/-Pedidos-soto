import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- 1. Importar TypeOrmModule
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity'; // <--- Asegúrate de que las rutas a tus entidades sean correctas
import { ItemPedido } from './entities/item-pedido.entity'; // (Ajusta según los nombres de tus archivos en la carpeta entities)

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, ItemPedido]), // <--- 2. Registrar las entidades aquí
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}