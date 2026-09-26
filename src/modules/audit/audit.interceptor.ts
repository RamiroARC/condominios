import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_METADATA_KEY, AuditMeta } from './audit.decorator';
import { AuthUser } from '../auth/auth-user.decorator';

/** Mapea el método HTTP a la acción de auditoría. */
const METHOD_ACTION: Record<string, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

/**
 * Registra en la bitácora de auditoría los handlers marcados con @Auditable,
 * pero solo tras una respuesta exitosa (métodos de escritura). Las lecturas
 * (GET) se ignoran para no inflar la bitácora.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditMeta | undefined>(
      AUDIT_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest();
    const action = METHOD_ACTION[req.method as string];

    // Solo auditamos handlers marcados y operaciones de escritura.
    if (!meta || !action) {
      return next.handle();
    }

    const user = req.user as AuthUser | undefined;
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];

    return next.handle().pipe(
      tap((result) => {
        const entityId =
          req.params?.id ??
          (result && typeof result === 'object'
            ? (result as { _id?: unknown; id?: unknown })._id ??
              (result as { id?: unknown }).id
            : undefined);

        void this.auditService.record({
          organizationId: user?.organizationId ?? null,
          userId: user?.userId ?? null,
          action,
          module: meta.module,
          entity: meta.entity,
          entityId: entityId ? String(entityId) : undefined,
          newValues:
            action === 'DELETE' ? null : (req.body as Record<string, unknown>),
          ip: typeof ip === 'string' ? ip : undefined,
        });
      }),
    );
  }
}
