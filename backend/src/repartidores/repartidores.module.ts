import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuthModule } from '../auth/auth.module';
import { RepartidoresService } from './repartidores.service';
import { RepartidoresController } from './repartidores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), AuthModule],
  controllers: [RepartidoresController],
  providers: [RepartidoresService],
})
export class RepartidoresModule {}
