import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Contenido del JWT validado, disponible en cada request autenticado. */
export interface AuthUser {
  userId: string;
  organizationId: string | null;
  email: string;
  permissions: string[];
  condominiumIds: string[]; // condominios a los que el usuario tiene acceso (scoping)
}

/** Extrae el usuario autenticado del request. Ej: @CurrentUser() user: AuthUser */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);
