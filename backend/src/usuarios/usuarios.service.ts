import { Injectable, NotFoundException } from '@nestjs/common';
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
    const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(nuevoUsuario);
  }

  async findAll() {
    return await this.usuarioRepository.find();
  }

  async findOne(id: string) {
    return await this.usuarioRepository.findOne({
      where: { id } as any,
    });
  }

  async cambiarRol(id: string, rol: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } as any });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.rol = rol;
    await this.usuarioRepository.save(usuario);
    const { password_hash, ...resto } = usuario;
    return resto;
  }

  async cambiarEstado(id: string, activo: boolean) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } as any });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    usuario.activo = activo;
    await this.usuarioRepository.save(usuario);
    const { password_hash, ...resto } = usuario;
    return resto;
  }
}