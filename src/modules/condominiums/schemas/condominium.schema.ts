import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CondominiumDocument = HydratedDocument<Condominium>;

@Schema({ _id: false })
export class CondominiumSettings {
  @Prop({ default: 'PEN' })
  currency!: string;

  @Prop({ default: 'America/Lima' })
  timezone!: string;

  @Prop({ type: Object, default: {} })
  billing!: Record<string, unknown>;
}

@Schema({ timestamps: true, collection: 'condominiums' })
export class Condominium {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: string;

  @Prop({ type: CondominiumSettings, default: () => ({}) })
  settings!: CondominiumSettings;
}

export const CondominiumSchema = SchemaFactory.createForClass(Condominium);

// code único dentro de la organización.
CondominiumSchema.index({ organizationId: 1, code: 1 }, { unique: true });
