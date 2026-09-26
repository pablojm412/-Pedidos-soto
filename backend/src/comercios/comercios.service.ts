import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comercio } from './entities/comercio.entity';

@Injectable()
export class ComerciosService {
  constructor(
    @InjectRepository(Comercio)
    private readonly comercioRepository: Repository<Comercio>,
  ) {}

  async create(createComercioDto: any) {
    const nuevoComercio = this.comercioRepository.create(createComercioDto);
    return await this.comercioRepository.save(nuevoComercio);
  }

  async findAll() {
    return await this.comercioRepository.find({ relations: { usuario: true } } as any);
  }

  async findOne(id: number) {
    return await this.comercioRepository.findOne({
      where: { id },
      relations: { usuario: true },
    } as any);
  }
}