import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit:meta';

export interface AuditMeta {
  module: string;
  entity?: string;
}

/**
 * Marca un handler para ser auditado. El interceptor de auditoría registrará
 * la operación (acción derivada del método HTTP) tras una respuesta exitosa.
 * Ej: @Auditable({ module: 'condominiums', entity: 'Condominium' })
 */
export const Auditable = (meta: AuditMeta) => SetMetadata(AUDIT_METADATA_KEY, meta);
