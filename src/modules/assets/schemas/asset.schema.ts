import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssetDocument = HydratedDocument<Asset>;

export const ASSET_TYPES = [
  'ELEVATOR',
  'PUMP',
  'GENERATOR',
  'GATE',
  'HVAC',
  'OTHER',
] as const;

export const ASSET_STATUSES = [
  'OPERATIONAL',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
] as const;

/**
 * Activo del condominio (ascensor, bomba, generador…) con su estado operativo
 * y próxima fecha de mantenimiento.
 */
@Schema({ timestamps: true, collection: 'assets' })
export class Asset {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  /**
   * Si está presente, el activo pertenece a ese edificio (ej. ascensor de una
   * torre). Si es null, es un activo a nivel de condominio (ej. bomba general).
   */
  @Prop({ type: Types.ObjectId, ref: 'Building', default: null })
  buildingId?: Types.ObjectId | null;

  @Prop({ required: true })
  name!: string;

  @Prop({ enum: ASSET_TYPES, default: 'OTHER' })
  type!: string;

  @Prop({ enum: ASSET_STATUSES, default: 'OPERATIONAL', index: true })
  status!: string;

  @Prop({ type: Date, default: null })
  nextMaintenanceAt?: Date | null;

  @Prop()
  location?: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

AssetSchema.index({ organizationId: 1, condominiumId: 1, type: 1 });
