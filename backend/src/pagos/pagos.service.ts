import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async create(createPagoDto: any) {
    const nuevoPago = this.pagoRepository.create(createPagoDto);
    return await this.pagoRepository.save(nuevoPago);
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
