import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Comercio } from '../comercios/entities/comercio.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module'; // 1. Agregamos el import de AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Comercio, Pedido]),
    AuthModule, // 2. Lo sumamos acá para que el Guard de JWT funcione
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}