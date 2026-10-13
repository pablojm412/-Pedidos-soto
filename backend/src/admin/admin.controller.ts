import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('estadisticas')
  estadisticas() {
    return this.adminService.estadisticasGenerales();
  }

  @Get('reportes/ventas')
  reporteVentas(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('comercio_id') comercioId?: string,
  ) {
    return this.adminService.reporteVentas(desde, hasta, comercioId ? +comercioId : undefined);
  }
}