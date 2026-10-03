import { Controller, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RepartidoresService } from './repartidores.service';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';

@Controller('repartidores')
export class RepartidoresController {
  constructor(private readonly repartidoresService: RepartidoresService) {}

  @Patch(':id/ubicacion')
  actualizarUbicacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUbicacionDto,
  ) {
    return this.repartidoresService.actualizarUbicacion(id, dto);
  }
}