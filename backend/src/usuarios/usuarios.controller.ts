import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CambiarRolDto } from './dto/cambiar-rol.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';

@UseGuards(JwtAuthGuard)
@Roles('admin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id/rol')
  cambiarRol(@Param('id') id: string, @Body() dto: CambiarRolDto) {
    return this.usuariosService.cambiarRol(id, dto.rol);
  }

  @Patch(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body() dto: CambiarEstadoDto) {
    return this.usuariosService.cambiarEstado(id, dto.activo);
  }
}