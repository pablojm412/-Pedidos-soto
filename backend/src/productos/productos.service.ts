import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: any) {
    const nuevoProducto = this.productoRepository.create(createProductoDto);
    return await this.productoRepository.save(nuevoProducto);
  }

  async findAll() {
    return await this.productoRepository.find({ relations: { comercio: true } } as any);
  }

  async findOne(id: number) {
    return await this.productoRepository.findOne({
      where: { id },
      relations: { comercio: true },
    } as any);
  }

  async findByComercio(comercioId: number) {
    return await this.productoRepository.find({
      where: { comercio_id: comercioId },
    });
  }
}