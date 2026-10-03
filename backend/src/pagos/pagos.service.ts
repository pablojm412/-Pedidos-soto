import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PagosService {
  private mercadoPagoClient: MercadoPagoConfig;

  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {
    // Inicializa Mercado Pago con la variable de entorno que configuramos
    this.mercadoPagoClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN || '',
    });
  }

  async crearPreferenciaYPago(dto: CreatePagoDto) {
    try {
      // 1. Creamos la preferencia en la API de Mercado Pago
      const preference = new Preference(this.mercadoPagoClient);
      const mpResponse = await preference.create({
        body: {
          items: [
            {
              id: '1',
              title: dto.title,
              unit_price: Number(dto.unit_price),
              quantity: Number(dto.quantity),
              currency_id: 'ARS',
            },
          ],
          back_urls: {
            success: 'https://tu-sitio.com/success',
            failure: 'https://tu-sitio.com/failure',
            pending: 'https://tu-sitio.com/pending',
          },
          auto_return: 'approved',
        },
      });

      // 2. Guardamos el registro inicial del pago en tu base de datos PostgreSQL
      const nuevoPago = this.pagoRepository.create({
        pedido_id: dto.pedido_id,
        proveedor: 'mercadopago',
        estado: 'pendientes', // Estado inicial
        monto: dto.unit_price * dto.quantity,
        referencia_externa: mpResponse.id, // Guardamos el ID de preferencia de MP
      });

      const pagoGuardado = await this.pagoRepository.save(nuevoPago);

      // 3. Retornamos tanto el link de pago (init_point) como el registro de la DB
      return {
        pago: pagoGuardado,
        init_point: mpResponse.init_point, // Link para redirigir al usuario al checkout
        sandbox_init_point: mpResponse.sandbox_init_point, // Link de prueba
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error al procesar el pago con Mercado Pago: ${error?.message || error}`,
      );
    }
  }

  async findAll() {
    return await this.pagoRepository.find({
      relations: { pedido: true },
    } as any);
  }

  async findOne(id: number) {
    return await this.pagoRepository.findOne({
      where: { id },
      relations: { pedido: true },
    } as any);
  }

  async findByPedido(pedidoId: number) {
    return await this.pagoRepository.findOne({
      where: { pedido_id: pedidoId },
      relations: { pedido: true },
    } as any);
  }
}