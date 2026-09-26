import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UtilityReadingDocument = HydratedDocument<UtilityReading>;

export const UTILITY_TYPES = ['WATER', 'ELECTRICITY', 'GAS'] as const;

/**
 * Lectura de medidor de un servicio (agua/luz/gas) para un departamento en un
 * periodo. El consumo se deriva de la diferencia entre lectura actual y anterior.
 */
@Schema({ timestamps: true, collection: 'utilityReadings' })
export class UtilityReading {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true, index: true })
  apartmentId!: Types.ObjectId;

  @Prop({ enum: UTILITY_TYPES, default: 'WATER' })
  utilityType!: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, min: 1, max: 12 })
  month!: number;

  @Prop({ required: true, min: 0 })
  previousReading!: number;

  @Prop({ required: true, min: 0 })
  currentReading!: number;

  /** Consumo = currentReading - previousReading (calculado al guardar). */
  @Prop({ default: 0 })
  consumption!: number;
}

export const UtilityReadingSchema = SchemaFactory.createForClass(UtilityReading);

// Una lectura por (depto, servicio, año, mes).
UtilityReadingSchema.index(
  { organizationId: 1, apartmentId: 1, utilityType: 1, year: 1, month: 1 },
  { unique: true },
);
