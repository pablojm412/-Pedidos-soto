import { Body, Controller, HttpCode, HttpException, Logger, Post, Query } from '@nestjs/common';
import { PagosService } from './pagos.service';

/**
 * Webhook de Mercado Pago. Es PÚBLICO (sin JwtAuthGuard) porque lo llama Mercado Pago, no un usuario.
 * Es seguro porque el estado del pago nunca se toma de lo que llega: se consulta a Mercado Pago.
 */
@Controller('pagos')
export class PagosWebhookController {
  private readonly logger = new Logger(PagosWebhookController.name);

  constructor(private readonly pagosService: PagosService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Query() query: any, @Body() body: any) {
    const tipo = query?.type ?? query?.topic ?? body?.type ?? body?.topic;
    const id = query?.['data.id'] ?? query?.id ?? body?.data?.id;

    if (tipo !== 'payment' || !id) return { ok: true };

    try {
      await this.pagosService.procesarWebhook(String(id));
    } catch (error) {
      // Casos esperados (pago de otra app, notificación de prueba, etc.): se responde 200 para que no reintente.
      if (error instanceof HttpException) {
        this.logger.warn(`Webhook ignorado (pago ${id}): ${error.message}`);
        return { ok: true };
      }
      // Fallo inesperado: se deja subir el 500 para que Mercado Pago reintente.
      throw error;
    }
    return { ok: true };
  }
}