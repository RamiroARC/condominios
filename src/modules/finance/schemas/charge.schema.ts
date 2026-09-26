import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChargeDocument = HydratedDocument<Charge>;

export const CHARGE_STATUSES = ['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'] as const;

/**
 * Cargo generado a un departamento por un concepto dentro de un periodo.
 * Guarda snapshots del concepto y del cálculo para que el histórico no cambie
 * aunque el concepto o el coeficiente se modifiquen después.
 */
@Schema({ timestamps: true, collection: 'charges' })
export class Charge {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'BillingPeriod', required: true, index: true })
  periodId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true, index: true })
  apartmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'FeeConcept', required: true })
  conceptId!: Types.ObjectId;

  /** Instantánea del concepto al momento de generar el cargo. */
  @Prop({ type: Object, required: true })
  conceptSnapshot!: {
    name: string;
    allocationMethod: string;
    baseAmount: number;
  };

  /** Instantánea del cálculo (cómo se llegó al monto). */
  @Prop({ type: Object, required: true })
  calculationSnapshot!: {
    method: string;
    participationCoefficient?: number;
    apartmentsCount?: number;
    formula: string;
  };

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: 0, min: 0 })
  paidAmount!: number;

  @Prop({ enum: CHARGE_STATUSES, default: 'PENDING', index: true })
  status!: string;
}

export const ChargeSchema = SchemaFactory.createForClass(Charge);

// Evita cargos duplicados del mismo concepto al mismo depto en el mismo periodo.
ChargeSchema.index(
  { organizationId: 1, periodId: 1, apartmentId: 1, conceptId: 1 },
  { unique: true },
);
