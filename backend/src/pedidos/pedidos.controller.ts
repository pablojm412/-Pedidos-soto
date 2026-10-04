import {
  Controller, Get, Post, Body, Param, Patch, Query, ParseIntPipe, UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Req() req: any, @Body() createPedidoDto: any) {
    return this.pedidosService.create(createPedidoDto, req.user);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('comercio_id') comercioId?: string,
    @Query('cliente_id') clienteId?: string,
  ) {
    const idComercio = comercioId ? parseInt(comercioId, 10) : undefined;
    const idCliente = clienteId ? parseInt(clienteId, 10) : undefined;
    return this.pedidosService.findAll(req.user, idComercio, idCliente);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id, req.user);
  }

  @Roles('comercio', 'repartidor', 'admin')
  @Patch(':id/estado')
  updateEstado(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string },
  ) {
    return this.pedidosService.updateEstado(id, body.estado, req.user);
  }

  @Roles('repartidor')
  @Patch('repartidor/:repartidorId/ubicacion')
  actualizarUbicacion(
    @Req() req: any,
    @Param('repartidorId', ParseIntPipe) repartidorId: number,
    @Body() dto: { latitud: number; longitud: number },
  ) {
    if (req.user.sub !== repartidorId) {
      throw new ForbiddenException('Solo podés actualizar tu propia ubicación');
    }
    return this.pedidosService.actualizarUbicacion(repartidorId, dto);
  }
}