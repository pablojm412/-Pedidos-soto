import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Comercio } from '../comercios/entities/comercio.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Comercio)
    private readonly comercioRepository: Repository<Comercio>,
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
  ) {}

  async estadisticasGenerales() {
    const totalComercios = await this.comercioRepository.count();
    const comerciosActivos = await this.comercioRepository.count({ where: { abierto: true } });
    const totalPedidos = await this.pedidoRepository.count();
    const pedidosEntregados = await this.pedidoRepository.count({ where: { estado: 'entregado' } });

    const resultado = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select('SUM(pedido.total)', 'total')
      .where('pedido.estado = :estado', { estado: 'entregado' })
      .getRawOne();

    return {
      totalComercios,
      comerciosActivos,
      totalPedidos,
      pedidosEntregados,
      ventasTotales: Number(resultado.total) || 0,
    };
  }

  async reporteVentas(desde?: string, hasta?: string, comercioId?: number) {
    const query = this.pedidoRepository
      .createQueryBuilder('pedido')
      .where('pedido.estado = :estado', { estado: 'entregado' });

    if (desde && hasta) {
      query.andWhere('pedido.creado_en BETWEEN :desde AND :hasta', { desde, hasta });
    }
    if (comercioId) {
      query.andWhere('pedido.comercio_id = :comercioId', { comercioId });
    }

    const pedidos = await query.getMany();
    const total = pedidos.reduce((acc, p) => acc + Number(p.total), 0);

    return {
      cantidadPedidos: pedidos.length,
      totalVendido: total,
      pedidos,
    };
  }
}