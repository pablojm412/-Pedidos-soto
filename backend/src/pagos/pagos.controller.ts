import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  create(@Body() createPagoDto: any) {
    return this.pagosService.create(createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Get('pedido/:pedidoId')
  findByPedido(@Param('pedidoId') pedidoId: string) {
    return this.pagosService.findByPedido(+pedidoId);
  }
}