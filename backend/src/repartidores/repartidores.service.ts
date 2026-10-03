import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';

@Injectable()
export class RepartidoresService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async actualizarUbicacion(id: number, dto: ActualizarUbicacionDto) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Repartidor no encontrado');
    }

    if (usuario.rol !== 'repartidor') {
      throw new BadRequestException('Este usuario no tiene rol de repartidor');
    }

    usuario.ubicacion_lat = dto.lat;
    usuario.ubicacion_lng = dto.lng;
    usuario.ubicacion_actualizada_en = new Date();

    await this.usuarioRepository.save(usuario);

    return {
      id: usuario.id,
      ubicacion_lat: usuario.ubicacion_lat,
      ubicacion_lng: usuario.ubicacion_lng,
      ubicacion_actualizada_en: usuario.ubicacion_actualizada_en,
    };
  }
}