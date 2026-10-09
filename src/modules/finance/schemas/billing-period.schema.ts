import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BillingPeriodDocument = HydratedDocument<BillingPeriod>;

export const PERIOD_STATUSES = ['OPEN', 'CLOSED'] as const;

/** Instantánea inmutable tomada al cerrar el periodo (append-only). */
@Schema({ _id: false })
export class PeriodSnapshot {
  @Prop({ required: true })
  totalCharged!: number;

  @Prop({ required: true })
  totalPaid!: number;

  @Prop({ required: true })
  chargesCount!: number;

  @Prop({ type: Object, default: {} })
  byConcept!: Record<string, number>;

  @Prop({ default: () => new Date() })
  takenAt!: Date;
}
const PeriodSnapshotSchema = SchemaFactory.createForClass(PeriodSnapshot);

/**
 * Periodo de facturación (típicamente mensual) de un condominio.
 * Al cerrarse se congela con un snapshot y ya no admite nuevos cargos.
 */
@Schema({ timestamps: true, collection: 'billingPeriods' })
export class BillingPeriod {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  /** Año y mes del periodo. */
  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, min: 1, max: 12 })
  month!: number;

  @Prop({ required: true })
  dueDate!: Date;

  @Prop({ enum: PERIOD_STATUSES, default: 'OPEN', index: true })
  status!: string;

  @Prop({ type: Date, default: null })
  closedAt?: Date | null;

  @Prop({ type: PeriodSnapshotSchema, default: null })
  snapshot?: PeriodSnapshot | null;
}

export const BillingPeriodSchema = SchemaFactory.createForClass(BillingPeriod);

// Un solo periodo por (condominio, año, mes).
BillingPeriodSchema.index(
  { organizationId: 1, condominiumId: 1, year: 1, month: 1 },
  { unique: true },
);
