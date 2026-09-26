import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerciosService } from './comercios.service';
import { ComerciosController } from './comercios.controller';
import { Comercio } from './entities/comercio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comercio])],
  controllers: [ComerciosController],
  providers: [ComerciosService],
})
export class ComerciosModule {}