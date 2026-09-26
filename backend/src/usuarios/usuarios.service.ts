import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: any) {
    // Creamos una nueva instancia del usuario con los datos que llegan
    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    // Lo guardamos en la base de datos PostgreSQL
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    // Retorna todos los usuarios registrados
    return await this.usuarioRepository.find();
  }

  async findOne(id: number) {
    return await this.usuarioRepository.findOneBy({ id });
  }
}