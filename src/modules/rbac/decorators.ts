import { SetMetadata } from '@nestjs/common';
import type { Permission } from './permissions';

export const PERMISSIONS_KEY = 'required_permissions';

/** Marca los permisos requeridos para un endpoint. Ej: @RequirePermissions('apartments:write') */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const IS_PUBLIC_KEY = 'is_public';

/** Marca un endpoint como público (sin autenticación). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
