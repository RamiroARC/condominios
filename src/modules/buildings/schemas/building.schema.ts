import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BuildingDocument = HydratedDocument<Building>;

@Schema({ timestamps: true, collection: 'buildings' })
export class Building {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ default: 0 })
  floors!: number;

  @Prop({ default: 0 })
  apartmentsCount!: number;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;

  @Prop({ type: Object, default: {} })
  settings!: Record<string, unknown>;
}

export const BuildingSchema = SchemaFactory.createForClass(Building);

BuildingSchema.index({ organizationId: 1, condominiumId: 1 });
BuildingSchema.index({ condominiumId: 1, code: 1 }, { unique: true });
