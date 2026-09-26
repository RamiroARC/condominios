import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApartmentDocument = HydratedDocument<Apartment>;

@Schema({ timestamps: true, collection: 'apartments' })
export class Apartment {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Building', required: true })
  buildingId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop()
  floor?: number;

  @Prop()
  area?: number;

  /**
   * Coeficiente de participación (para distribución proporcional de gastos).
   * Se usa como base en el cálculo, pero el valor aplicado a cada cargo se
   * congela en el snapshot del cargo (inmutabilidad financiera).
   */
  @Prop({ default: 0 })
  participationCoefficient!: number;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;
}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);

ApartmentSchema.index({ organizationId: 1, condominiumId: 1, buildingId: 1 });
ApartmentSchema.index({ buildingId: 1, code: 1 }, { unique: true });
