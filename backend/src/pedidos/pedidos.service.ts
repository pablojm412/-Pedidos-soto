import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { ItemPedido } from './entities/item-pedido.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private readonly itemPedidoRepository: Repository<ItemPedido>,
  ) {}

  async create(createPedidoDto: any) {
    const { items, ...pedidoData } = createPedidoDto;

    const nuevoPedido = this.pedidoRepository.create(pedidoData);
    const pedidoGuardado: any = await this.pedidoRepository.save(nuevoPedido);
    const pedidoId = pedidoGuardado.id;

    if (items && items.length > 0) {
      const itemsEntidades = items.map((item: any) => 
        this.itemPedidoRepository.create({
          ...item,
          pedido_id: pedidoId,
        })
      );
      await this.itemPedidoRepository.save(itemsEntidades);
    }

    return this.findOne(pedidoId);
  }

  async findAll() {
    return await this.pedidoRepository.find({
      relations: { cliente: true, comercio: true, repartidor: true },
    } as any);
  }

  async findOne(id: number) {
    return await this.pedidoRepository.findOne({
      where: { id },
      relations: { cliente: true, comercio: true, repartidor: true },
    } as any);
  }
}