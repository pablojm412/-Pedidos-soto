import {
  BadRequestException, ForbiddenException, Injectable, InternalServerErrorException,
  NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { Pago } from './entities/pago.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { UsuarioToken } from '../auth/jwt-auth.guard';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    private readonly config: ConfigService,
  ) {}

  /** El cliente de Mercado Pago se crea al usarlo, así el backend arranca aunque falte el token. */
  private clienteMP() {
    const accessToken = this.config.get<string>('MP_ACCESS_TOKEN');
    if (!accessToken) {
      throw new ServiceUnavailableException('Los pagos online no están configurados');
    }
    return new MercadoPagoConfig({ accessToken });
  }

  /** Consulta a Mercado Pago el pago real. Nunca se confía en lo que llega en la notificación. */
  private async consultarPago(paymentId: string) {
    if (!/^\d+$/.test(paymentId)) throw new BadRequestException('payment_id inválido');
    const cliente = this.clienteMP();
    try {
      return (await new Payment(cliente).get({ id: paymentId })) as any;
    } catch {
      throw new NotFoundException('No se encontró ese pago en Mercado Pago');
    }
  }

  /** Traduce el pago de Mercado Pago al estado del pago local y lo guarda. */
  private async aplicarEstado(payment: any, pedido: Pedido, pago: Pago) {
    if (pago.estado === 'aprobado') return pago;

    let estado = 'pendiente';
    if (payment.status === 'approved') estado = 'aprobado';
    else if (payment.status === 'rejected' || payment.status === 'cancelled') estado = 'rechazado';

    if (estado === 'aprobado') {
      const esperado = Math.round(Number(pedido.total) * 100);
      const pagado = Math.round(Number(payment.transaction_amount) * 100);
      if (esperado !== pagado) {
        throw new BadRequestException('El monto pagado no coincide con el del pedido');
      }
    }

    pago.estado = estado;
    pago.referencia_externa = String(payment.id);
    return await this.pagoRepository.save(pago);
  }

  async crearPreferencia(pedidoId: number, user: UsuarioToken) {
    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      throw new BadRequestException('pedido_id inválido');
    }

    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
      relations: { items: { producto: true } },
    } as any);
    if (!pedido) throw new NotFoundException('El pedido no existe');
    if (pedido.cliente_id !== user.sub) throw new ForbiddenException('Este pedido no es tuyo');
    if (pedido.estado !== 'pendiente') {
      throw new BadRequestException('Solo se pueden pagar pedidos pendientes');
    }
    if (!pedido.items?.length) throw new BadRequestException('El pedido no tiene productos');

    let pago = await this.pagoRepository.findOne({ where: { pedido_id: pedido.id } } as any);
    if (pago?.estado === 'aprobado') throw new BadRequestException('El pedido ya está pagado');

    // Los precios salen de los items guardados en el pedido, no del navegador
    const items = pedido.items.map((i) => ({
      id: String(i.producto_id),
      title: i.producto?.nombre ?? `Producto ${i.producto_id}`,
      unit_price: Number(i.precio_unitario),
      quantity: i.cantidad,
      currency_id: 'ARS',
    }));
    if (Number(pedido.costo_envio) > 0) {
      items.push({
        id: 'envio',
        title: 'Envío',
        unit_price: Number(pedido.costo_envio),
        quantity: 1,
        currency_id: 'ARS',
      });
    }

    const frontend = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    const backend = this.config.get<string>('BACKEND_URL') ?? '';
    const volver = `${frontend}/pago-resultado`;
    const cliente = this.clienteMP();

    let mp: any;
    try {
      mp = await new Preference(cliente).create({
        body: {
          items,
          external_reference: String(pedido.id),
          back_urls: { success: volver, failure: volver, pending: volver },
          // Redirige solo a /pago-resultado cuando el pago se aprueba.
          // Mercado Pago lo rechaza con http://localhost, así que solo se activa con https.
          ...(frontend.startsWith('https://') ? { auto_return: 'approved' } : {}),
          // Aviso directo de Mercado Pago a este backend (webhook). Requiere URL pública https.
          ...(backend.startsWith('https://')
            ? { notification_url: `${backend}/pagos/webhook` }
            : {}),
        },
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error al crear el pago en Mercado Pago: ${error?.message || error}`,
      );
    }

    if (pago) {
      pago.estado = 'pendiente';
      pago.monto = pedido.total;
      pago.referencia_externa = mp.id;
    } else {
      pago = this.pagoRepository.create({
        pedido_id: pedido.id,
        proveedor: 'mercadopago',
        estado: 'pendiente',
        monto: pedido.total,
        referencia_externa: mp.id,
      });
    }
    const guardado = await this.pagoRepository.save(pago);

    return {
      pago_id: guardado.id,
      init_point: mp.init_point,
      sandbox_init_point: mp.sandbox_init_point,
    };
  }

  /** El cliente vuelve a la app: se consulta a Mercado Pago el estado real del pago. */
  async verificar(paymentId: string, user: UsuarioToken) {
    const payment = await this.consultarPago(paymentId);

    const pedidoId = Number(payment?.external_reference);
    if (!Number.isInteger(pedidoId)) {
      throw new BadRequestException('El pago no corresponde a un pedido');
    }

    const pedido = await this.pedidoRepository.findOne({ where: { id: pedidoId } } as any);
    if (!pedido) throw new NotFoundException('El pedido no existe');
    if (pedido.cliente_id !== user.sub && user.rol !== 'admin') {
      throw new ForbiddenException('Este pedido no es tuyo');
    }

    const pago = await this.pagoRepository.findOne({ where: { pedido_id: pedidoId } } as any);
    if (!pago) throw new NotFoundException('No hay un pago iniciado para este pedido');

    return await this.aplicarEstado(payment, pedido, pago);
  }

  /**
   * Webhook: Mercado Pago avisa que un pago cambió. No hay usuario ni JWT,
   * por eso solo se usa el id y el estado se consulta directo a Mercado Pago.
   * Es idempotente: si el pago ya estaba aprobado no hace nada.
   */
  async procesarWebhook(paymentId: string) {
    const payment = await this.consultarPago(paymentId);

    const pedidoId = Number(payment?.external_reference);
    if (!Number.isInteger(pedidoId)) {
      throw new BadRequestException('El pago no corresponde a un pedido');
    }

    const pedido = await this.pedidoRepository.findOne({ where: { id: pedidoId } } as any);
    if (!pedido) throw new NotFoundException('El pedido no existe');

    const pago = await this.pagoRepository.findOne({ where: { pedido_id: pedidoId } } as any);
    if (!pago) throw new NotFoundException('No hay un pago iniciado para este pedido');

    return await this.aplicarEstado(payment, pedido, pago);
  }

  /**
   * Busca en Mercado Pago los pagos de un pedido (por external_reference) y actualiza el estado local.
   * La app lo llama sola al abrir Mis pedidos o el seguimiento, así el cliente no tiene que hacer nada.
   */
  async sincronizar(pedidoId: number, user: UsuarioToken) {
    const pedido = await this.pedidoRepository.findOne({ where: { id: pedidoId } } as any);
    if (!pedido) throw new NotFoundException('El pedido no existe');
    if (pedido.cliente_id !== user.sub && user.rol !== 'admin') {
      throw new ForbiddenException('Este pedido no es tuyo');
    }

    const pago = await this.pagoRepository.findOne({ where: { pedido_id: pedidoId } } as any);
    if (!pago) return null;
    if (pago.estado === 'aprobado') return pago;

    const cliente = this.clienteMP();
    let resultados: any[] = [];
    try {
      const r: any = await new Payment(cliente).search({
        options: {
          criteria: 'desc',
          sort: 'date_created',
          external_reference: String(pedidoId),
        },
      } as any);
      resultados = r?.results ?? [];
    } catch {
      return pago;
    }

    const elegido = resultados.find((p) => p.status === 'approved') ?? resultados[0];
    if (!elegido) return pago;
    return await this.aplicarEstado(elegido, pedido, pago);
  }

  async findByPedido(pedidoId: number, user: UsuarioToken) {
    const pedido = await this.pedidoRepository.findOne({ where: { id: pedidoId } } as any);
    if (!pedido) throw new NotFoundException('El pedido no existe');
    if (pedido.cliente_id !== user.sub && user.rol !== 'admin') {
      throw new ForbiddenException('Este pedido no es tuyo');
    }
    return await this.pagoRepository.findOne({
      where: { pedido_id: pedidoId },
      relations: { pedido: true },
    } as any);
  }

  async findAll() {
    return await this.pagoRepository.find({ relations: { pedido: true } } as any);
  }

  async findOne(id: number) {
    return await this.pagoRepository.findOne({
      where: { id },
      relations: { pedido: true },
    } as any);
  }
}
