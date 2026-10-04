import {
  Controller,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { RepartidoresService } from './repartidores.service';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';
import { JwtAuthGuard, UsuarioToken } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('repartidores')
export class RepartidoresController {
  constructor(private readonly repartidoresService: RepartidoresService) {}

  /** Solo el propio repartidor (o un admin) puede actualizar su ubicación. */
  @Patch(':id/ubicacion')
  actualizarUbicacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUbicacionDto,
    @Req() req: any,
  ) {
    const user = req.user as UsuarioToken;
    const esElMismoRepartidor = user.rol === 'repartidor' && user.sub === id;
    if (user.rol !== 'admin' && !esElMismoRepartidor) {
      throw new ForbiddenException('Solo el propio repartidor puede actualizar su ubicación');
    }
    return this.repartidoresService.actualizarUbicacion(id, dto);
  }
}
