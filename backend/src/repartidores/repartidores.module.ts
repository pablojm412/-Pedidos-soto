import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RepartidoresService } from './repartidores.service';
import { RepartidoresController } from './repartidores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [RepartidoresController],
  providers: [RepartidoresService],
})
export class RepartidoresModule {}