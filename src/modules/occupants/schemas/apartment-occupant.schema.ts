import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApartmentOccupantDocument = HydratedDocument<ApartmentOccupant>;

export const OCCUPANT_ROLES = [
  'OWNER',
  'CO_OWNER',
  'TENANT',
  'RESIDENT',
  'OCCUPANT',
] as const;

/**
 * Tabla puente N:M entre apartments y persons, con atributos e historial.
 * Permite saber quién ocupa un departamento y desde cuándo (startDate/endDate).
 */
@Schema({ timestamps: true, collection: 'apartmentOccupants' })
export class ApartmentOccupant {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Apartment', required: true })
  apartmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Person', required: true })
  personId!: Types.ObjectId;

  @Prop({ enum: OCCUPANT_ROLES, required: true })
  role!: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ default: null })
  endDate?: Date | null;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ enum: ['ACTIVE', 'ENDED'], default: 'ACTIVE' })
  status!: string;
}

export const ApartmentOccupantSchema =
  SchemaFactory.createForClass(ApartmentOccupant);

ApartmentOccupantSchema.index({ apartmentId: 1, status: 1 });
ApartmentOccupantSchema.index({ personId: 1 });
ApartmentOccupantSchema.index({ organizationId: 1, condominiumId: 1 });
