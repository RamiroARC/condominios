import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../rbac/decorators';
import type { AuthUser } from '../auth/auth-user.decorator';

/**
 * Garantiza que exista un organizationId en el contexto para operaciones de negocio.
 * El organizationId proviene SIEMPRE del JWT verificado, nunca del cliente.
 * Los SUPER_ADMIN (organizationId null) se manejan aparte en endpoints de plataforma.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('No autenticado');

    // SUPER_ADMIN (sin organización) solo accede a endpoints de plataforma,
    // que no pasan por este guard. Un usuario normal debe tener organización.
    if (!user.organizationId) {
      throw new ForbiddenException('El usuario no está asociado a una organización');
    }
    return true;
  }
}
