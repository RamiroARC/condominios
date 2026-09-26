import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

export const PAYMENT_METHODS = [
  'CASH',
  'TRANSFER',
  'CARD',
  'CHECK',
  'OTHER',
] as const;

/**
 * Pago registrado y aplicado a un cargo. Un pago salda total o parcialmente un
 * cargo; los abonos parciales dejan el cargo en estado PARTIAL.
 */
@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Charge', required: true, index: true })
  chargeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true })
  apartmentId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ enum: PAYMENT_METHODS, default: 'TRANSFER' })
  method!: string;

  @Prop({ required: true })
  paidAt!: Date;

  @Prop()
  reference?: string;

  /** Usuario que registró el pago. */
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  registeredBy?: Types.ObjectId | null;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ organizationId: 1, chargeId: 1 });
PaymentSchema.index({ organizationId: 1, paidAt: -1 });
