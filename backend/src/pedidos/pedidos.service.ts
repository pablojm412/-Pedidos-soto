import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Comercio } from '../comercios/entities/comercio.entity';
import { Producto } from '../productos/entities/producto.entity';
import { UsuarioToken } from '../auth/jwt-auth.guard';

const ESTADOS_VALIDOS = ['pendiente', 'aceptado', 'en_camino', 'entregado', 'cancelado'];
const MAX_ITEMS = 50;
const MAX_CANTIDAD = 50;

const RELACIONES = {
  cliente: true,
  comercio: true,
  repartidor: true,
  items: { producto: true },
  pagos: true,
};

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Comercio)
    private readonly comercioRepository: Repository<Comercio>,
  ) {}

  /**
   * El cliente, el estado y todos los importes salen del servidor.
   * Del body solo se toman comercio_id, direccion_entrega y, de cada ítem, producto_id y cantidad.
   */
  async create(createPedidoDto: any, user: UsuarioToken) {
    const comercioId = Number(createPedidoDto?.comercio_id);
    const direccion =
      typeof createPedidoDto?.direccion_entrega === 'string'
        ? createPedidoDto.direccion_entrega.trim()
        : '';
    const itemsEntrada: any[] = Array.isArray(createPedidoDto?.items) ? createPedidoDto.items : [];

    if (!Number.isInteger(comercioId) || comercioId <= 0) {
      throw new BadRequestException('comercio_id inválido');
    }
    if (direccion.length < 3 || direccion.length > 120) {
      throw new BadRequestException('La dirección de entrega debe tener entre 3 y 120 caracteres');
    }
    if (itemsEntrada.length === 0 || itemsEntrada.length > MAX_ITEMS) {
      throw new BadRequestException('El pedido debe tener entre 1 y 50 productos');
    }

    // Une las líneas repetidas del mismo producto
    const cantidades = new Map<number, number>();
    for (const it of itemsEntrada) {
      const productoId = Number(it?.producto_id);
      const cantidad = Number(it?.cantidad);
      if (
        !Number.isInteger(productoId) || productoId <= 0 ||
        !Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD
      ) {
        throw new BadRequestException('Producto o cantidad inválidos');
      }
      const total = (cantidades.get(productoId) ?? 0) + cantidad;
      if (total > MAX_CANTIDAD) {
        throw new BadRequestException(`Máximo ${MAX_CANTIDAD} unidades por producto`);
      }
      cantidades.set(productoId, total);
    }

    return await this.pedidoRepository.manager.transaction(async (em) => {
      const comercio = await em.findOne(Comercio, { where: { id: comercioId } });
      if (!comercio) throw new NotFoundException('El comercio no existe');
      if (!comercio.abierto) throw new BadRequestException('El comercio está cerrado');

      const productos = await em.find(Producto, {
        where: { id: In([...cantidades.keys()]), comercio_id: comercioId },
      });
      if (productos.length !== cantidades.size) {
        throw new BadRequestException('Algún producto no existe o no pertenece a este comercio');
      }

      // Importes en centavos para evitar errores de decimales
      let subtotalCent = 0;
      const items = productos.map((p) => {
        if (!p.disponible) {
          throw new BadRequestException(`"${p.nombre}" no está disponible`);
        }
        const cantidad = cantidades.get(p.id)!;
        const precioCent = Math.round(Number(p.precio) * 100);
        subtotalCent += precioCent * cantidad;
        return em.create(ItemPedido, {
          producto_id: p.id,
          cantidad,
          precio_unitario: precioCent / 100,
        });
      });

      const envioCent = Math.round(Number(comercio.costo_envio_base) * 100);

      const pedido = em.create(Pedido, {
        cliente_id: user.sub,
        comercio_id: comercio.id,
        estado: 'pendiente',
        subtotal: subtotalCent / 100,
        costo_envio: envioCent / 100,
        total: (subtotalCent + envioCent) / 100,
        direccion_entrega: direccion,
        items,
      });
      return await em.save(pedido);
    });
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

    const lista = await this.pedidoRepository.find({ where, relations: RELACIONES } as any);
    return lista.map((p) => this.conEstadoPago(p));
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
    return this.conEstadoPago(pedido);
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

  /** Deja solo el estado del último pago y oculta el resto de los datos del pago. */
  private conEstadoPago(pedido: any) {
    const { pagos, ...resto } = pedido;
    const ultimo = pagos?.length ? [...pagos].sort((a: any, b: any) => b.id - a.id)[0] : null;
    return { ...resto, estado_pago: ultimo?.estado ?? null };
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