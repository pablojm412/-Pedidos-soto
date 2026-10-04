import { Controller, Get, Post, Body, Param, Patch, Query, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: any) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll(@Query('comercio_id') comercioId?: string) {
    const id = comercioId ? parseInt(comercioId, 10) : undefined;
    return this.pedidosService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: string },
  ) {
    return this.pedidosService.updateEstado(id, body.estado);
  }

  @Patch('repartidor/:repartidorId/ubicacion')
  actualizarUbicacion(
    @Param('repartidorId', ParseIntPipe) repartidorId: number,
    @Body() dto: { latitud: number; longitud: number },
  ) {
    return this.pedidosService.actualizarUbicacion(repartidorId, dto);
  }
}
