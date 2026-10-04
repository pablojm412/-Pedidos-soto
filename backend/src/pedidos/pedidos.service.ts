import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';

const ESTADOS_VALIDOS = ['pendiente', 'aceptado', 'en_camino', 'entregado', 'cancelado'];

const RELACIONES = {
  cliente: true,
  comercio: true,
  repartidor: true,
  items: { producto: true },
};

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async create(createPedidoDto: any) {
    const nuevoPedido = this.pedidoRepository.create(createPedidoDto);
    return await this.pedidoRepository.save(nuevoPedido);
  }

  async findAll(comercioId?: number) {
    return await this.pedidoRepository.find({
      where: comercioId ? { comercio_id: comercioId } : {},
      relations: RELACIONES,
    } as any);
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: RELACIONES,
    } as any);
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return pedido;
  }

  async updateEstado(id: number, estado: string) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      );
    }

    const pedido = await this.pedidoRepository.findOne({ where: { id } } as any);
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    pedido.estado = estado as any;
    return await this.pedidoRepository.save(pedido);
  }

  async actualizarUbicacion(repartidorId: number, dto: { latitud: number; longitud: number }) {
    const pedido = await this.pedidoRepository.findOne({
      where: { repartidor_id: repartidorId, estado: 'en_camino' },
    } as any);

    if (!pedido) {
      throw new NotFoundException('No se encontró ningún pedido activo en camino para este repartidor');
    }

    pedido.latitud = dto.latitud;
    pedido.longitud = dto.longitud;

    await this.pedidoRepository.save(pedido);

    return {
      mensaje: 'Ubicación actualizada correctamente',
      pedidoId: pedido.id,
      latitud: pedido.latitud,
      longitud: pedido.longitud,
    };
  }
}
