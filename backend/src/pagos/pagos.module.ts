import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PagosWebhookController } from './pagos-webhook.controller';
import { Pago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Pedido]), AuthModule, ConfigModule],
  controllers: [PagosController, PagosWebhookController],
  providers: [PagosService],
})
export class PagosModule {}