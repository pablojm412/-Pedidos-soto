import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';
import { Comercio } from '../comercios/entities/comercio.entity';
import { Producto } from '../productos/entities/producto.entity';
import { UsuarioToken } from '../auth/jwt-auth.guard';
import { CreatePedidoDto } from './dto/create-pedido.dto';

const ESTADOS_VALIDOS = ['pendiente', 'aceptado', 'en_camino', 'entregado', 'cancelado'];

// Propinas que ofrece el carrito (Sin tip, $200, $400, $600)
const PROPINAS_VALIDAS = [0, 200, 400, 600];
const MAX_CANTIDAD = 50;

const redondear = (n: number) => Math.round(n * 100) / 100;

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
    private readonly dataSource: DataSource,
  ) {}

  /**
   * El cliente, el estado inicial, los precios, el subtotal y el total salen del
   * servidor. Del body solo se leen comercio_id, direccion_entrega y, de cada ítem,
   * producto_id y cantidad. Pedido e ítems se guardan en una sola transacción.
   */
  async create(dto: CreatePedidoDto, user: UsuarioToken) {
    const comercioId = Number(dto?.comercio_id);
    const direccion = String(dto?.direccion_entrega ?? '').trim();
    const itemsDto = Array.isArray(dto?.items) ? dto.items : [];

    if (!Number.isInteger(comercioId) || comercioId <= 0) {
      throw new BadRequestException('comercio_id inválido');
    }
    if (!direccion) {
      throw new BadRequestException('Falta la dirección de entrega');
    }
    if (itemsDto.length === 0) {
      throw new BadRequestException('El pedido no tiene productos');
    }

    const lineas = itemsDto.map((it) => ({
      producto_id: Number(it?.producto_id),
      cantidad: Number(it?.cantidad),
    }));
    const lineaInvalida = lineas.some(
      (l) =>
        !Number.isInteger(l.producto_id) ||
        !Number.isInteger(l.cantidad) ||
        l.cantidad < 1 ||
        l.cantidad > MAX_CANTIDAD,
    );
    if (lineaInvalida) {
      throw new BadRequestException('Productos o cantidades inválidos');
    }

    return await this.dataSource.transaction(async (manager) => {
      const comercio = await manager.findOne(Comercio, { where: { id: comercioId } } as any);
      if (!comercio) {
        throw new NotFoundException('Comercio no encontrado');
      }

      const ids = Array.from(new Set(lineas.map((l) => l.producto_id)));
      const productos = await manager.find(Producto, { where: { id: In(ids) } } as any);
      const porId = new Map(productos.map((p) => [p.id, p]));

      let subtotal = 0;
      const items = lineas.map((l) => {
        const p = porId.get(l.producto_id);
        if (!p) {
          throw new BadRequestException(`El producto ${l.producto_id} no existe`);
        }
        if (p.comercio_id !== comercioId) {
          throw new BadRequestException(`El producto "${p.nombre}" no pertenece a este comercio`);
        }
        if (!p.disponible) {
          throw new BadRequestException(`El producto "${p.nombre}" no está disponible`);
        }
        const precio = Number(p.precio);
        subtotal += precio * l.cantidad;
        return manager.create(ItemPedido, {
          producto_id: p.id,
          cantidad: l.cantidad,
          precio_unitario: precio,
        });
      });
      subtotal = redondear(subtotal);

      // Envío: el del comercio si existe ese campo; si no, el que mandó el carrito (nunca negativo)
      const envioComercio = (comercio as any).costo_envio;
      const costoEnvio = redondear(Math.max(0, Number(envioComercio ?? dto.costo_envio ?? 0)) || 0);

      // Propina: se deduce del total que mandó el carrito y solo se acepta si es una de las opciones válidas
      const propinaEnviada = redondear(Number(dto.total) - subtotal - costoEnvio);
      const propina = PROPINAS_VALIDAS.includes(propinaEnviada) ? propinaEnviada : 0;

      const total = redondear(subtotal + costoEnvio + propina);

      const pedido = manager.create(Pedido, {
        cliente_id: user.sub,
        comercio_id: comercioId,
        estado: 'pendiente',
        subtotal,
        costo_envio: costoEnvio,
        total,
        direccion_entrega: direccion,
      });
      const guardado = await manager.save(pedido);

      for (const item of items) {
        item.pedido_id = guardado.id;
      }
      await manager.save(items);

      return await manager.findOne(Pedido, {
        where: { id: guardado.id },
        relations: { items: { producto: true } },
      } as any);
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
