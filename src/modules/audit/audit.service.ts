import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface AuditEntry {
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  module: string;
  entity?: string;
  entityId?: string;
  previousValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ip?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly model: Model<AuditLogDocument>,
  ) {}

  /**
   * Escribe un registro de auditoría. Nunca debe romper el flujo principal:
   * si falla, se registra el error pero no se propaga.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.model.create({
        organizationId: entry.organizationId
          ? new Types.ObjectId(entry.organizationId)
          : null,
        userId: entry.userId ? new Types.ObjectId(entry.userId) : null,
        action: entry.action,
        module: entry.module,
        entity: entry.entity,
        entityId: entry.entityId,
        previousValues: entry.previousValues ?? null,
        newValues: entry.newValues ?? null,
        ip: entry.ip,
      });
    } catch (err) {
      this.logger.error(
        `No se pudo escribir el registro de auditoría: ${(err as Error).message}`,
      );
    }
  }
}
