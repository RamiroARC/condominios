import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

/**
 * Registro de auditoría append-only. Escrito por el interceptor de auditoría
 * en operaciones sensibles y por servicios financieros dentro de su transacción.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'auditLogs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Organization', default: null, index: true })
  organizationId!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId!: Types.ObjectId | null;

  @Prop({ required: true })
  action!: string; // CREATE, UPDATE, DELETE, APPROVE, CANCEL, CLOSE_PERIOD, REGISTER_PAYMENT, GENERATE_CHARGE

  @Prop({ required: true })
  module!: string;

  @Prop()
  entity?: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object, default: null })
  previousValues?: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  newValues?: Record<string, unknown> | null;

  @Prop()
  ip?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
