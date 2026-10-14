import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(dto: RegistroDto) {
    const existe = await this.usuarioRepository.findOne({ where: { email: dto.email } });
    if (existe) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const nuevoUsuario = this.usuarioRepository.create({
      email: dto.email,
      nombre: dto.nombre,
      telefono: dto.telefono,
      rol: 'cliente',
      password_hash,
    });

    const guardado = await this.usuarioRepository.save(nuevoUsuario);

    const { password_hash: _, ...usuarioSinPassword } = guardado;

    return {
      mensaje: 'Usuario registrado con éxito',
      usuario: usuarioSinPassword,
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.password_hash')
      .where('usuario.email = :email', { email: dto.email })
      .getOne();

    // ============ DEBUG - BORRAR DESPUÉS ============
    console.log('=== DEBUG LOGIN ===');
    console.log('dto.email:', dto.email);
    console.log('dto.password:', JSON.stringify(dto.password));
    console.log('usuario encontrado?:', !!usuario);
    if (usuario) {
      console.log('usuario.password_hash:', JSON.stringify(usuario.password_hash));
      console.log('usuario.password_hash length:', usuario.password_hash?.length);
      console.log('usuario.password_hash tipo:', typeof usuario.password_hash);
    }
    // ================================================

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const esValida = await bcrypt.compare(dto.password, usuario.password_hash);

    // ============ DEBUG - BORRAR DESPUÉS ============
    console.log('>>> esValida:', esValida);
    console.log('===================');
    // ================================================

    if (!esValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}