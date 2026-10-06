import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ComerciosService } from './comercios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('comercios')
export class ComerciosController {
  constructor(private readonly comerciosService: ComerciosService) {}

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post()
  create(@Body() createComercioDto: any) {
    return this.comerciosService.create(createComercioDto);
  }

  @Get()
  findAll() {
    return this.comerciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comerciosService.findOne(+id);
  }
}