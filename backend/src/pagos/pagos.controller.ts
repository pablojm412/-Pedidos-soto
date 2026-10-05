import {
  Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /** Crea el pago de un pedido propio. El monto sale del pedido, no del body. */
  @Post()
  create(@Req() req: any, @Body() dto: CreatePagoDto) {
    return this.pagosService.crearPreferencia(Number(dto?.pedido_id), req.user);
  }

  /** Consulta a Mercado Pago el estado de un pago y actualiza el pago local. */
  @Get('verificar/:paymentId')
  verificar(@Req() req: any, @Param('paymentId') paymentId: string) {
    return this.pagosService.verificar(paymentId, req.user);
  }

  @Get('pedido/:pedidoId')
  findByPedido(@Req() req: any, @Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return this.pagosService.findByPedido(pedidoId, req.user);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.pagosService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagosService.findOne(id);
  }
}