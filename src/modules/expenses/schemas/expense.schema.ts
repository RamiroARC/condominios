import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

export const EXPENSE_CATEGORIES = [
  'ELEVATOR_MAINTENANCE',
  'COMMON_ELECTRICITY',
  'WATER_SANITATION',
  'CLEANING_GARDENING',
  'SECURITY',
  'OTHER',
] as const;

/**
 * Gasto del condominio registrado en un mes. Alimenta la distribución de gastos
 * y la serie de ingresos vs gastos del panel.
 */
@Schema({ timestamps: true, collection: 'expenses' })
export class Expense {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ enum: EXPENSE_CATEGORIES, default: 'OTHER' })
  category!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ required: true })
  incurredAt!: Date;

  /** Año y mes derivados de incurredAt para agregación rápida. */
  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, min: 1, max: 12 })
  month!: number;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ organizationId: 1, condominiumId: 1, year: 1, month: 1 });
ExpenseSchema.index({ organizationId: 1, condominiumId: 1, category: 1 });
