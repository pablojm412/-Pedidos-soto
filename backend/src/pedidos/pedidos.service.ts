import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Comercio } from '../comercios/entities/comercio.entity';
import { UsuarioToken } from '../auth/jwt-auth.guard';

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
    @InjectRepository(Comercio)
    private readonly comercioRepository: Repository<Comercio>,
  ) {}

  /** El cliente y el estado inicial salen del servidor, no del body. */
  async create(createPedidoDto: any, user: UsuarioToken) {
    const datos: any = { ...createPedidoDto, cliente_id: user.sub, estado: 'pendiente' };
    delete datos.id;
    const nuevoPedido = this.pedidoRepository.create(datos);
    return await this.pedidoRepository.save(nuevoPedido);
  }

  async findAll(user: UsuarioToken, comercioId?: number, clienteId?: number) {
    const where: any = {};

    if (clienteId !== undefined && clienteId === user.sub) {
      // "Mis pedidos": los que hizo este usuario como cliente
      where.cliente_id = user.sub;
    } else if (user.rol === 'cliente') {
      where.cliente_id = user.sub;
    } else if (user.rol === 'comercio') {
      const comercio = await this.comercioDe(user);
      if (!comercio) throw new ForbiddenException('Tu cuenta no tiene un comercio asignado');
      where.comercio_id = comercio.id;
    } else if (user.rol === 'repartidor') {
      where.estado = In(['aceptado', 'en_camino']);
    } else if (user.rol === 'admin') {
      if (comercioId) where.comercio_id = comercioId;
      if (clienteId) where.cliente_id = clienteId;
    } else {
      throw new ForbiddenException('No tenés permiso para ver pedidos');
    }

    return await this.pedidoRepository.find({ where, relations: RELACIONES } as any);
  }

  async findOne(id: number, user?: UsuarioToken) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: RELACIONES,
    } as any);
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    if (user) await this.verificarAcceso(pedido, user);
    return pedido;
  }

  async updateEstado(id: number, estado: string, user?: UsuarioToken) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new BadRequestException(
        `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
      );
    }

    const pedido = await this.pedidoRepository.findOne({ where: { id } } as any);
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    if (user?.rol === 'comercio') {
      const comercio = await this.comercioDe(user);
      if (!comercio || comercio.id !== pedido.comercio_id) {
        throw new ForbiddenException('Este pedido no es de tu comercio');
      }
    } else if (user?.rol === 'repartidor' && estado !== 'entregado') {
      throw new ForbiddenException('El repartidor solo puede marcar pedidos como entregados');
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

  private comercioDe(user: UsuarioToken) {
    return this.comercioRepository.findOne({ where: { usuario_id: user.sub } } as any);
  }

  private async verificarAcceso(pedido: any, user: UsuarioToken) {
    if (pedido.cliente_id === user.sub) return;
    if (user.rol === 'admin' || user.rol === 'repartidor') return;
    if (user.rol === 'comercio') {
      const comercio = await this.comercioDe(user);
      if (comercio && comercio.id === pedido.comercio_id) return;
    }
    throw new ForbiddenException('Este pedido no es tuyo');
  }
}