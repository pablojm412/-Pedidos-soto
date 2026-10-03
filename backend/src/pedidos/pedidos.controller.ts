import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: any) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  @Patch('repartidor/:repartidorId/ubicacion')
  actualizarUbicacion(
    @Param('repartidorId', ParseIntPipe) repartidorId: number,
    @Body() dto: { latitud: number; longitud: number },
  ) {
    return this.pedidosService.actualizarUbicacion(repartidorId, dto);
  }
}