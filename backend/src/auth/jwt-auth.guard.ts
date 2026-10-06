import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles.decorator';

export interface UsuarioToken {
  sub: number;
  email: string;
  rol: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Tenés que iniciar sesión');

    let payload: UsuarioToken;
    try {
      payload = this.jwt.verify<UsuarioToken>(token);
    } catch {
      throw new UnauthorizedException('Sesión inválida o vencida');
    }
    req.user = payload;

    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles?.length && !roles.includes(payload.rol)) {
      throw new ForbiddenException('No tenés permiso para esta acción');
    }
    return true;
  }
}